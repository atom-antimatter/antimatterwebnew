"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEarlyAccessModal } from "@/store";

const fieldBase =
  "w-full rounded-xl bg-black/30 border border-white/15 px-4 py-3 text-sm placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-violet-500/50";

export default function EarlyAccessModal() {
  const { open, setOpen } = useEarlyAccessModal();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  const close = useCallback(() => {
    setOpen(false);
    setSubmitted(false);
    setError(null);
  }, [setOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Optional: replace with your API endpoint when ready
      // const res = await fetch("/api/early-access", { method: "POST", body: JSON.stringify({ email }) });
      await new Promise((r) => setTimeout(r, 600));
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="early-access-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />
      <div
        ref={dialogRef}
        className="relative z-[101] w-[92vw] max-w-[420px] rounded-3xl border border-foreground/20 bg-gradient-to-b from-[#0F0F19] to-[#0A0A12] shadow-2xl overflow-hidden pointer-events-auto"
      >
        <div className="p-5 sm:p-7 border-b border-foreground/10 flex items-center justify-between">
          <h2 id="early-access-title" className="text-lg sm:text-xl font-semibold">
            Get Early Access
          </h2>
          <button
            type="button"
            className="text-foreground/70 hover:text-foreground text-2xl leading-none"
            onClick={close}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-5 sm:p-7">
          {submitted ? (
            <div className="text-center py-4">
              <p className="text-foreground/90 font-medium">You&apos;re on the list.</p>
              <p className="text-sm text-foreground/70 mt-1">
                We&apos;ll notify you when Atom Browser is ready.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-6 px-6 py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 hover:bg-violet-500/30 transition"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-foreground/70 mb-5">
                Join the waitlist for Atom Browser. We&apos;ll email you when early access is available.
              </p>
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="early-access-email" className="text-xs uppercase tracking-wide opacity-70">
                    Email
                  </label>
                  <input
                    id="early-access-email"
                    type="email"
                    className={fieldBase}
                    placeholder="you@company.com"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {submitting ? "Submitting…" : "Get Early Access"}
                </button>
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
