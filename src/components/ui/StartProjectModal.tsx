"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStartProjectModal } from "@/store";

type AnalysisResult = {
  html: string;
  error?: string;
};

const fieldBase =
  "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/20";

export default function StartProjectModal() {
  const { open, setOpen } = useStartProjectModal();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const scrollYRef = useRef<number>(0);

  useEffect(() => {
    if (open) {
      scrollYRef.current = window.scrollY;
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, scrollYRef.current);
    }
  }, [open]);

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function onAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/site-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl, industry, name, title }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Failed to analyze site.");
      } else {
        setResult({ html: data?.result || "" });
      }
    } catch (err: any) {
      setError("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function onDownload() {
    if (!result?.html) return;
    const blob = new Blob([
      `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>Antimatter AI Website Audit</title><meta name="viewport" content="width=device-width, initial-scale=1"/><style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Inter,Helvetica,Arial,sans-serif;background:#0B0B12;color:#EAEAF0;padding:32px;line-height:1.7}h2{margin-top:28px;margin-bottom:12px}h3{margin-top:16px;margin-bottom:8px}p{margin:8px 0}ul{margin:10px 0 10px 20px}li{margin:6px 0}</style></head><body><article>${result.html}</article></body></html>`
    ], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "antimatter-ai-website-audit.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function onEmailSend() {
    if (!result?.html || !email) return;
    setSubmitting(true);
    setError(null);
    try {
      const resp = await fetch("/api/email-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, html: result.html, subject: "Your Antimatter AI Website Audit" }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        const details = typeof data?.details === "string" ? `: ${data.details}` : "";
        setError((data?.error || "Failed to send email") + details);
      }
    } catch (e) {
      setError("Email failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = useMemo(() => {
    const hasUrl = websiteUrl.trim().length > 0;
    try {
      if (hasUrl) new URL(websiteUrl.trim());
    } catch {
      return false;
    }
    return hasUrl;
  }, [websiteUrl]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div
        ref={dialogRef}
        className="relative z-[101] w-[92vw] max-w-[880px] max-h-[90vh] rounded-3xl border border-foreground/20 bg-gradient-to-b from-[#0F0F19] to-[#0A0A12] shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
      >
        <div className="p-5 sm:p-7 border-b border-foreground/10 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold">Start your project</h3>
          <button className="text-foreground/70 hover:text-foreground" onClick={close} aria-label="Close">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-6 p-4 sm:p-6 overflow-y-auto">
          <form className="lg:col-span-2 flex flex-col gap-3 sm:gap-4" onSubmit={onAnalyze}>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide opacity-70">Current website URL</label>
              <input
                className={fieldBase}
                placeholder="https://example.com"
                inputMode="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide opacity-70">Industry</label>
              <input
                className={fieldBase}
                placeholder="Healthcare, eCommerce, SaaS, etc."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide opacity-70">Your name</label>
              <input
                className={fieldBase}
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide opacity-70">Title</label>
              <input
                className={fieldBase}
                placeholder="Head of Product"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide opacity-70">Email for report (optional)</label>
              <input
                className={fieldBase}
                placeholder="you@company.com"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="mt-2 sm:mt-4 h-11 rounded-xl bg-foreground text-background disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Analyzing…" : "Analyze my site"}
            </button>

            {error && (
              <div className="text-red-400 text-sm pt-2">{error}</div>
            )}
          </form>

          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-white/10 mt-4 lg:mt-0 pt-4 lg:pt-0 lg:pl-6 min-h-[220px]">
            {!result && !submitting && (
              <div className="opacity-70 text-sm">
                Enter your site URL to get an AI-driven audit with prioritized recommendations across UI/UX, SEO, performance, and platform fit.
              </div>
            )}
            {submitting && (
              <div className="opacity-80 text-sm">Running analysis…</div>
            )}
            {result?.html && (
              <>
                <article className="prose prose-invert max-w-none [&_*]:text-foreground/90" dangerouslySetInnerHTML={{ __html: result.html }} />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={onDownload} disabled={submitting} className="h-10 px-4 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed">
                    Download HTML
                  </button>
                  <button onClick={onEmailSend} disabled={!email || submitting} className="h-10 px-4 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed">
                    Email Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


