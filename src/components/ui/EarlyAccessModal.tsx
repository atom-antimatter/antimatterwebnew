"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { GoArrowUpRight } from "react-icons/go";
import { useEarlyAccessModal } from "@/store";
import buttonStyles from "./css/Button.module.css";

const fieldBase =
  "w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3.5 text-sm text-white placeholder:text-white/45 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] focus:outline-none focus:ring-2 focus:ring-[#8587e3]/45";

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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
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
        className="relative z-[101] flex max-h-[min(90vh,720px)] w-[92vw] max-w-[460px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(133,135,227,0.18),transparent_32%),linear-gradient(180deg,#10111b_0%,#090a12_100%)] shadow-[0_30px_120px_rgba(0,0,0,0.65),0_0_40px_rgba(105,106,172,0.12)] pointer-events-auto"
      >
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="p-6 sm:p-7 border-b border-white/8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-[#8587e3]/30 bg-[#8587e3]/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#c9caf7]">
              Atom Browser
            </div>
            <h2 id="early-access-title" className="text-xl sm:text-2xl font-semibold text-white">
              Get Early Access
            </h2>
            <p className="mt-2 max-w-[28rem] text-sm leading-6 text-white/65">
              Join the waitlist and we&apos;ll notify you as soon as Atom Browser is ready for early users.
            </p>
          </div>
          <button
            type="button"
            className="text-xl leading-none text-white/65 transition hover:text-white"
            onClick={close}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-6 sm:p-7">
          {submitted ? (
            <div className="py-3 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#8587e3]/30 bg-[#8587e3]/12 text-[#d7d8ff] shadow-[0_0_30px_rgba(133,135,227,0.18)]">
                <GoArrowUpRight className="size-7" />
              </div>
              <p className="text-lg font-medium text-white">You&apos;re on the list.</p>
              <p className="mt-2 text-sm text-white/65">
                We&apos;ll notify you when Atom Browser is ready.
              </p>
              <button
                type="button"
                onClick={close}
                className={`group relative mx-auto mt-6 block w-full max-w-[240px] rounded-full text-left text-white ${buttonStyles.button} ${buttonStyles.fluidBtn}`}
                style={{ padding: 0 }}
              >
                <span className="relative flex min-h-[54px] items-center rounded-full pl-5 pr-20">
                  <span className="text-sm font-medium">Close</span>
                  <span className="absolute right-1 top-1 bottom-1 rounded-full border border-white/20 bg-background/20 p-0.5">
                    <span className="flex h-full w-12 items-center justify-center rounded-full bg-white text-background transition-[width,transform] duration-500 ease-out group-hover:w-16">
                      <GoArrowUpRight className="size-7 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </span>
                </span>
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="early-access-email"
                    className="text-[11px] uppercase tracking-[0.22em] text-white/55"
                  >
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
                <p className="px-1 text-xs leading-5 text-white/50">
                  Product updates and early access invites. No spam.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`group relative block w-full rounded-full text-left text-white disabled:cursor-not-allowed disabled:opacity-60 ${buttonStyles.button} ${buttonStyles.fluidBtn}`}
                  style={{ padding: 0 }}
                >
                  <span className="relative flex min-h-[54px] items-center rounded-full pl-5 pr-20">
                    <span className="text-sm font-medium">
                      {submitting ? "Submitting..." : "Get Early Access"}
                    </span>
                    <span className="absolute right-1 top-1 bottom-1 rounded-full border border-white/20 bg-background/20 p-0.5">
                      <span className="flex h-full w-12 items-center justify-center rounded-full bg-white text-background transition-[width,transform] duration-500 ease-out group-hover:w-16">
                        <GoArrowUpRight className="size-7 transition-transform duration-300 group-hover:rotate-45" />
                      </span>
                    </span>
                  </span>
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
