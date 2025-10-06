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
  const [urlError, setUrlError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setUrlError(null);
    setSuccess(null);
    setResult(null);
    try {
      let normalized = websiteUrl.trim();
      if (normalized && !/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
      const response = await fetch("/api/site-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: normalized, industry, name, title }),
      });
      const data = await response.json();
      if (!response.ok) {
        const msg = String(data?.error || "Failed to analyze site.");
        if (/url|invalid/i.test(msg)) setUrlError(msg); else setError(msg);
      } else {
        const raw = data?.result || "";
        setResult({ html: sanitizeAuditHtml(raw) });
      }
    } catch (err: any) {
      setError("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDownloadPdf() {
    if (!result?.html) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const resp = await fetch("/api/quote", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: result.html }),
      });
      if (!resp.ok) throw new Error("Failed to generate PDF");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Antimatter-AI-Website-Audit.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSuccess("PDF downloaded.");
    } catch (e) {
      setError("Could not generate PDF. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onEmailSend() {
    if (!result?.html || !email) return;
    setSubmitting(true);
    setError(null);
    try {
      // Request a true PDF from the server (re-using the HTML)
      const pdfResp = await fetch("/api/quote", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: result.html }),
      });
      let pdfBase64: string | null = null;
      if (pdfResp.ok) {
        const blob = await pdfResp.blob();
        pdfBase64 = await blobToBase64(blob);
      }

      const resp = await fetch("/api/email-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, html: result.html, subject: "Your Antimatter AI Website Audit", pdfBase64 }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        const details = typeof data?.details === "string" ? `: ${data.details}` : "";
        setError((data?.error || "Failed to send email") + details);
      } else {
        setSuccess("Email sent.");
      }
    } catch (e) {
      setError("Email failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function blobToBase64(b: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = (reader.result as string) || "";
        const base64 = res.includes(",") ? res.split(",")[1] : res;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(b);
    });
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
        className="relative z-[101] w-[92vw] max-w-[1040px] max-h-[90vh] rounded-3xl border border-foreground/20 bg-gradient-to-b from-[#0F0F19] to-[#0A0A12] shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
      >
        <div className="p-5 sm:p-7 border-b border-foreground/10 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold">Get your Free Website Audit</h3>
          <button className="text-foreground/70 hover:text-foreground" onClick={close} aria-label="Close">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-6 p-4 sm:p-6 min-h-[360px] h-[70vh]">
          <form className="sm:col-span-1 flex flex-col gap-3 sm:gap-4 relative z-[2]" onSubmit={onAnalyze}>
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
              {urlError && <div className="text-red-400 text-xs pt-1">{urlError}</div>}
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
                type="email"
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
            {success && (
              <div className="text-emerald-400 text-sm pt-2">{success}</div>
            )}

            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onDownloadPdf}
                disabled={!result?.html || submitting}
                className="h-10 px-4 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Download PDF
              </button>
              <button
                type="button"
                onClick={onEmailSend}
                disabled={!email || !result?.html || submitting}
                className="h-10 px-4 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Email Report
              </button>
            </div>
          </form>

          <div className="sm:col-span-1 border-t sm:border-t-0 sm:border-l border-white/10 mt-4 sm:mt-0 pt-4 sm:pt-0 sm:pl-6 min-h-[220px] h-full flex flex-col z-[1]">
            <div className="h-[60vh] rounded-xl border border-white/10 bg-white/5">
              <div
                className="h-[60vh] overflow-y-auto overscroll-contain p-4 pr-5"
                onWheelCapture={(e) => e.stopPropagation()}
                onTouchMoveCapture={(e) => e.stopPropagation()}
              >
              {!result && !submitting && (
                <div className="opacity-70 text-sm">
                  Enter your site URL to get an AI-driven audit with prioritized recommendations across UI/UX, SEO, performance, and platform fit.
                </div>
              )}
              {submitting && (
                <div className="opacity-80 text-sm flex items-center gap-3">
                  <span className="inline-block size-3 rounded-full bg-white/60 animate-pulse"></span>
                  <RotatingTasks />
                </div>
              )}
              {result?.html && (
                <>
                  <div className="auditContent text-sm leading-7">
                    <article dangerouslySetInnerHTML={{ __html: result.html }} />
                  </div>
                </>
              )}
              </div>
            </div>
            <style jsx>{`
              .auditContent h1 { font-size: 1.125rem; font-weight: 700; margin: 1rem 0 0.5rem; }
              .auditContent h2 { font-size: 1rem; font-weight: 700; margin: 1rem 0 0.5rem; }
              .auditContent h3 { font-size: 0.95rem; font-weight: 600; margin: 0.75rem 0 0.4rem; }
              .auditContent p { margin: 0.5rem 0; opacity: 0.95; }
              .auditContent ul { margin: 0.5rem 0 0.75rem 1.1rem; list-style: disc; }
              .auditContent li { margin: 0.25rem 0; }
              .auditContent strong { font-weight: 600; }
              .auditContent a { color: #9AE6B4; text-decoration: underline; }
            `}</style>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RotatingTasks() {
  const tasks = [
    "Fetching homepage",
    "Checking search competition",
    "Analyzing metadata",
    "Inspecting headings",
    "Auditing accessibility",
    "Reviewing performance",
    "Inferring tech stack",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % tasks.length), 1200);
    return () => clearInterval(id);
  }, []);
  return <span className="opacity-80">{tasks[idx]}…</span>;
}

function sanitizeAuditHtml(html: string): string {
  // Strip leftover markdown markers (#, *, etc.) and enforce spacing between sections
  const cleaned = html
    .replace(/[\r\n]+/g, "\n")
    .replace(/^\s*#+\s*/gm, "")
    .replace(/\*\s*(?=\w)/g, "")
    .replace(/\n{2,}/g, "\n\n");
  return cleaned;
}


