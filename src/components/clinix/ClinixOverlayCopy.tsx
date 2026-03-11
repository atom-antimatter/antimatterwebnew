"use client";

/**
 * Story beats for the scroll-scrub section. Ranges are [start, end) progress.
 */
export const CLINIX_STORY_BEATS = [
  {
    start: 0,
    end: 0.18,
    headline: "AI infrastructure for modern medical practices.",
    body: "Clinix unifies documentation, billing, and revenue cycle workflows into one intelligent operational layer.",
  },
  {
    start: 0.18,
    end: 0.38,
    headline: "Documentation, structured.",
    body: "Capture cleaner clinical information with AI-assisted documentation and scribing workflows.",
  },
  {
    start: 0.38,
    end: 0.58,
    headline: "Billing, prepared upstream.",
    body: "Support coding, claim readiness, and submission quality before revenue is lost downstream.",
  },
  {
    start: 0.58,
    end: 0.78,
    headline: "RCM, made visible.",
    body: "Surface denials, workflow bottlenecks, and leakage points across the revenue cycle.",
  },
  {
    start: 0.78,
    end: 1.01,
    headline: "Operations that scale.",
    body: "Help practices reduce administrative burden, improve collections, and operate with better financial visibility.",
  },
] as const;

function getBeatIndex(progress: number): number {
  for (let i = 0; i < CLINIX_STORY_BEATS.length; i++) {
    const b = CLINIX_STORY_BEATS[i];
    if (progress >= b.start && progress < b.end) return i;
  }
  return CLINIX_STORY_BEATS.length - 1;
}

/** Ease progress within a beat for smoother fade (0 at start, 1 at center, 0 at end). */
function beatBlend(progress: number, start: number, end: number): number {
  const mid = (start + end) / 2;
  const span = (end - start) / 2;
  if (span <= 0) return 1;
  const d = Math.abs(progress - mid);
  return Math.max(0, 1 - d / span);
}

type ClinixOverlayCopyProps = {
  progress: number;
};

export default function ClinixOverlayCopy({ progress }: ClinixOverlayCopyProps) {
  const index = getBeatIndex(progress);
  const current = CLINIX_STORY_BEATS[index];
  const currentBlend = beatBlend(progress, current.start, current.end);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[20] flex flex-col items-center justify-end px-6 pb-20 sm:pb-24 lg:pb-28 pt-20"
      aria-live="polite"
    >
      <div className="w-full max-w-2xl mx-auto text-center">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-white leading-[1.1] transition-opacity duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          style={{ opacity: Math.max(0.15, currentBlend) }}
        >
          {current.headline}
        </h2>
        <p
          className="mt-4 text-base sm:text-lg text-white/90 leading-relaxed max-w-xl mx-auto transition-opacity duration-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
          style={{ opacity: Math.max(0.15, currentBlend) }}
        >
          {current.body}
        </p>
      </div>
    </div>
  );
}
