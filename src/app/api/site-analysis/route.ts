import { NextResponse } from "next/server";

async function fetchHtmlSnippet(url: string): Promise<{ snippet: string; headers: Record<string, string>; fetchMs: number }> {
  try {
    const start = Date.now();
    const resp = await fetch(url, {
      headers: { "User-Agent": "AntimatterAI-SiteAudit/1.0" },
      cache: "no-store",
    });
    const fetchMs = Date.now() - start;
    if (!resp.ok) return { snippet: "", headers: {}, fetchMs } as { snippet: string; headers: Record<string, string>; fetchMs: number };
    const html = await resp.text();
    const headers: Record<string, string> = {
      "server": resp.headers.get("server") || "",
      "x-powered-by": resp.headers.get("x-powered-by") || "",
      "content-type": resp.headers.get("content-type") || "",
      "content-length": resp.headers.get("content-length") || String(html.length),
    };
    return { snippet: html.replace(/\s+/g, " ").slice(0, 8000), headers, fetchMs } as const;
  } catch {
    return { snippet: "", headers: {}, fetchMs: 0 };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { websiteUrl, industry, name, title } = body as {
      websiteUrl?: string;
      industry?: string;
      name?: string;
      title?: string;
    };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is missing OPENAI_API_KEY. Add it to .env.local." },
        { status: 500 }
      );
    }

    const url = (websiteUrl || "").trim();
    if (!url) {
      return NextResponse.json({ error: "Missing websiteUrl" }, { status: 400 });
    }
    let normalized = url;
    if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
    try {
      // Validate URL
      // eslint-disable-next-line no-new
      new URL(normalized);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const { snippet, headers, fetchMs } = await fetchHtmlSnippet(normalized);

    // Lightweight intra-site browsing: fetch up to 2 internal links for broader context
    async function fetchFewInternalLinks(rootUrl: string, html: string): Promise<string> {
      try {
        const origin = new URL(rootUrl).origin;
        const hrefs = Array.from(html.matchAll(/href\s*=\s*"([^"]+)"/gi))
          .map((m) => m[1])
          .filter((h) => !!h)
          .map((h) => (h.startsWith("http") ? h : h.startsWith("/") ? origin + h : origin + "/" + h))
          .filter((h) => {
            try { return new URL(h).origin === origin; } catch { return false; }
          });
        const unique = Array.from(new Set(hrefs)).slice(0, 2);
        const results = await Promise.race([
          Promise.all(unique.map((u) => fetchHtmlSnippet(u))),
          new Promise((resolve) => setTimeout(() => resolve([]), 3500)),
        ]) as { snippet: string }[];
        const combined = results
          .map((r, i) => `\n\n<!-- page:${i + 1} -->\n${(r?.snippet || "").replace(/\s+/g, " ").slice(0, 5000)}`)
          .join("\n");
        return combined;
      } catch {
        return "";
      }
    }

    const extraSnippets = await fetchFewInternalLinks(normalized, snippet);

    // Multi‑agent analysis with specialized prompts
    const agents: { key: string; heading: string; system: string }[] = [
      {
        key: "overview",
        heading: "Overview",
        system:
          "You are a principal strategist. Summarize the business intent and audience. Return only HTML under an <h2>Overview</h2> with short <p> paragraphs.",
      },
      {
        key: "ux",
        heading: "UI/UX Improvements",
        system:
          "You are a senior product designer. Provide concrete UI/UX improvements covering layout, hierarchy, visual design, readability, mobile, and motion. Return an <h2>UI/UX Improvements</h2> section with <ul><li> bullets.",
      },
      {
        key: "seo",
        heading: "Technical Performance",
        system:
          "You are a performance/SEO engineer. Analyze Core Web Vitals risks, render path, images/fonts, caching/CDN. Return an <h2>Technical Performance</h2> section with prioritized bullets and quick wins.",
      },
      {
        key: "accessibility",
        heading: "Accessibility",
        system:
          "You are an accessibility specialist. Provide an <h2>Accessibility</h2> section with actionable fixes: color contrast, semantics, keyboard, focus, ARIA.",
      },
      {
        key: "tech",
        heading: "Platform & Tech Stack",
        system:
          "You are a solutions architect. Infer likely stack from headers/HTML and propose upgrades. Return <h2>Platform & Tech Stack</h2> with short paragraphs.",
      },
      {
        key: "highImpact",
        heading: "High‑Impact Recommendations",
        system:
          "You are a growth lead. Return <h2>High‑Impact Recommendations</h2> with an ordered list (5–8) of the most leveraged actions and expected impact.",
      },
    ];

    const baseUser = `Audience Industry: ${industry || "(unspecified)"}
Requester: ${name || "(unspecified)"}${title ? ", " + title : ""}
Target URL: ${normalized}

Fetch Meta: first_byte_ms≈${fetchMs}, headers=${JSON.stringify(headers)}
Homepage HTML snippet (truncated):\n${snippet}
Secondary page snippets (truncated):\n${extraSnippets}`;

    const preferredModel = process.env.OPENAI_MODEL || "gpt-5";
    const fallbackModel = process.env.OPENAI_FALLBACK_MODEL || "gpt-4o-mini";

    async function callOpenAIFor(system: string) {
      async function run(model: string) {
        return fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: baseUser },
            ],
            temperature: 0.3,
          }),
        });
      }
      let r = await run(preferredModel);
      if (!r.ok) r = await run(fallbackModel);
      if (!r.ok) return "";
      const j = await r.json();
      return j?.choices?.[0]?.message?.content || "";
    }

    // Run agents in parallel
    const parts = await Promise.all(agents.map((a) => callOpenAIFor(a.system)));
    const merged = parts.join("\n\n");
    return NextResponse.json({ result: merged });
  } catch (e) {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}


