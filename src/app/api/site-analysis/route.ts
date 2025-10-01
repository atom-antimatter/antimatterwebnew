import { NextResponse } from "next/server";

// Ensure Node runtime on Vercel for external fetch + timeouts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function fetchHtmlSnippet(
  url: string
): Promise<{
  snippet: string;
  headers: Record<string, string>;
  fetchMs: number;
}> {
  try {
    const start = Date.now();
    const resp = await fetch(url, {
      headers: { "User-Agent": "AntimatterAI-SiteAudit/1.0" },
      cache: "no-store",
    });
    const fetchMs = Date.now() - start;
    if (!resp.ok)
      return { snippet: "", headers: {}, fetchMs } as {
        snippet: string;
        headers: Record<string, string>;
        fetchMs: number;
      };
    const html = await resp.text();
    const headers: Record<string, string> = {
      server: resp.headers.get("server") || "",
      "x-powered-by": resp.headers.get("x-powered-by") || "",
      "content-type": resp.headers.get("content-type") || "",
      "content-length":
        resp.headers.get("content-length") || String(html.length),
    };
    return {
      snippet: html.replace(/\s+/g, " ").slice(0, 8000),
      headers,
      fetchMs,
    } as const;
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
      return NextResponse.json(
        { error: "Missing websiteUrl" },
        { status: 400 }
      );
    }
    let normalized = url;
    if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
    try {
      // Validate URL
      new URL(normalized);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const { snippet, headers, fetchMs } = await fetchHtmlSnippet(normalized);

    // Compose prompts for separate domains
    const sharedContext = `Audience Industry: ${
      industry || "(unspecified)"
    }\nRequester: ${name || "(unspecified)"}${
      title ? ", " + title : ""
    }\nTarget URL: ${normalized}\nFetch Meta: first_byte_ms≈${fetchMs}, headers=${JSON.stringify(
      headers
    )}\nWebsite HTML snippet (truncated):\n${snippet}`;

    const prompts = {
      seo: "You are an enterprise SEO lead. Return strictly semantic HTML ONLY (no markdown, no backticks, no code fences). Produce <section data-part=seo> with <h2>SEO</h2> and concise bullets focused on what matters for the user. Cover: crawl/indexability, metadata, headings, internal linking, schema, image alts, page-speed SEO factors. Include a <h3>Prioritized Fixes</h3> with 6–8 highly specific, measurable actions (e.g., rewritten title/description examples, exact pages/patterns, expected impact). Be concrete; remove filler.",
      ux: "You are a senior product designer. Return strictly semantic HTML ONLY. Produce <section data-part=uiux> with <h2>UI/UX</h2> and short, relevant points tied to the snippet (hierarchy, readability, layout, visual design, motion, accessibility, mobile). Give a <h3>Top UX Fixes</h3> with 5–7 actionable bullets. No code fences.",
      tech: "You are a principal full‑stack architect. Return strictly semantic HTML ONLY. Produce <section data-part=tech> with <h2>Platform & Tech Stack</h2>, inferred technologies (if uncertain, say 'likely'), key risks, security considerations, CMS/e‑commerce notes, and a <h3>Recommended Upgrades</h3> with user‑relevant benefits. No backticks.",
      performance:
        "You are a web performance engineer. Return strictly semantic HTML ONLY. Produce <section data-part=perf> with <h2>Technical Performance</h2> focusing on Core Web Vitals hypotheses and a prioritized remediation plan with estimated impact in plain language (e.g., 'Reduce LCP by ~30%'). Keep it concise and relevant. No code fences.",
      composer:
        "You are a communications lead. Given separate HTML fragments (already HTML), compose a single cohesive, branded audit article. Output strictly semantic HTML ONLY (no markdown). Wrap in <article>. Order: <h2>Overview</h2>, <h2>UI/UX</h2>, <h2>SEO</h2>, <h2>Technical Performance</h2>, <h2>Platform & Tech Stack</h2>, <h2>High‑Impact Recommendations</h2> (top 6–8 actions with impact/difficulty). Remove any stray text like 'html' or backticks. Keep it concise and relevant to the user.",
    } as const;

    const streamHint = request.headers.get("x-stream");
    const preferredModel = process.env.OPENAI_MODEL;
    const fallbackModel = process.env.OPENAI_FALLBACK_MODEL;
    const modelInUse: string = (preferredModel ||
      fallbackModel ||
      "gpt-4o-mini") as string;

    async function chat(model: string, systemPrompt: string, user: string) {
      const controller = new AbortController();
      const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 20000);
      const to = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "User-Agent": "AntimatterAI-SiteAudit/1.0",
          },
          body: JSON.stringify({
            model,
            temperature: 0.3,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: user },
            ],
          }),
          signal: controller.signal,
        });
        if (!r.ok)
          throw new Error(`${r.status} ${r.statusText}: ${await r.text()}`);
        const data = await r.json();
        return String(data?.choices?.[0]?.message?.content || "");
      } finally {
        clearTimeout(to);
      }
    }

    // If streaming, send incremental chunks as each section completes
    const doStream = Boolean(streamHint);
    let seoHtml = "";
    let uxHtml = "";
    let techHtml = "";
    let perfHtml = "";

    if (doStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            seoHtml = await chat(modelInUse, prompts.seo, sharedContext);
            controller.enqueue(encoder.encode(seoHtml));
            uxHtml = await chat(modelInUse, prompts.ux, sharedContext);
            controller.enqueue(encoder.encode(uxHtml));
            techHtml = await chat(modelInUse, prompts.tech, sharedContext);
            controller.enqueue(encoder.encode(techHtml));
            perfHtml = await chat(
              modelInUse,
              prompts.performance,
              sharedContext
            );
            controller.enqueue(encoder.encode(perfHtml));

            const composed = await chat(
              modelInUse,
              prompts.composer,
              `Fragments:\n\n[SEO]\n${seoHtml}\n\n[UIUX]\n${uxHtml}\n\n[TECH]\n${techHtml}\n\n[PERF]\n${perfHtml}`
            );
            const resultHtml = composed?.includes("<article")
              ? composed
              : `<article>${composed}</article>`;
            controller.enqueue(encoder.encode(resultHtml));
          } catch (e) {
            console.error(e);
            controller.enqueue(
              encoder.encode(`<p>Error generating stream.</p>`)
            );
          } finally {
            controller.close();
          }
        },
      });
      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    } else {
      // Non-streamed parallel generation
      [seoHtml, uxHtml, techHtml, perfHtml] = await Promise.all([
        chat(modelInUse, prompts.seo, sharedContext),
        chat(modelInUse, prompts.ux, sharedContext),
        chat(modelInUse, prompts.tech, sharedContext),
        chat(modelInUse, prompts.performance, sharedContext),
      ]);
    }

    // Compose final article
    let composed = "";
    try {
      composed = await chat(
        modelInUse,
        prompts.composer,
        `Fragments:\n\n[SEO]\n${seoHtml}\n\n[UIUX]\n${uxHtml}\n\n[TECH]\n${techHtml}\n\n[PERF]\n${perfHtml}`
      );
    } catch {
      // Fallback: quick stitched HTML if composer times out, to avoid request timeout
      composed = `<article>${uxHtml}${seoHtml}${perfHtml}${techHtml}</article>`;
    }

    // Ensure result is wrapped for downstream consumers
    const resultHtml = composed?.includes("<article")
      ? composed
      : `<article>${composed}</article>`;

    // non-stream fallback return

    return NextResponse.json({
      result: resultHtml,
      parts: {
        seo: seoHtml,
        uiux: uxHtml,
        tech: techHtml,
        performance: perfHtml,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
