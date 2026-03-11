"use client";

import { useState } from "react";

export type ClinixExplodedMediaMode = "gif" | "frames";

export type ClinixExplodedMediaProps = {
  /** "gif" = single animated GIF (current). "frames" = future scroll-scrubbed frame sequence. */
  mode: ClinixExplodedMediaMode;
  /** Path to the GIF when mode is "gif". Served from public, e.g. "/clinix-exploded.gif". */
  gifSrc?: string;
  /** Future: paths to frame images for scroll-based scrubbing. Not used when mode is "gif". */
  frames?: string[];
};

const DEFAULT_GIF_SRC = "/clinix-exploded.gif";

export default function ClinixExplodedMedia({
  mode = "gif",
  gifSrc = DEFAULT_GIF_SRC,
  frames = [],
}: ClinixExplodedMediaProps) {
  const [loadStatus, setLoadStatus] = useState<"idle" | "loaded" | "error">("idle");
  const assetPath = mode === "gif" ? gifSrc : "(frames not yet implemented)";

  // Future: frame-sequence scroll scrubbing will go here.
  // When mode === "frames" and frames.length > 0, render a canvas or img that updates
  // based on scroll position (e.g. useScroll + frame index from scroll progress).
  if (mode === "frames" && frames.length > 0) {
    return (
      <div className="clinix-media-container min-h-[320px] aspect-[4/3] rounded-2xl border border-white/10 bg-[#0f0f10] flex items-center justify-center text-white/50 text-sm">
        Frame-sequence scroll animation (coming soon)
      </div>
    );
  }

  // Current: single animated GIF for reliable display.
  // Container has explicit dimensions so the image never collapses; no overlay covers the <img>.
  return (
    <div className="flex flex-col w-full" style={{ minWidth: 0 }}>
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#141416] to-[#0b0b0c] shadow-[0_0_60px_-15px_rgba(255,255,255,0.06),0_25px_50px_-12px_rgba(0,0,0,0.4)]"
        style={{
          aspectRatio: "4/3",
          minHeight: 280,
          maxWidth: "100%",
          width: "100%",
        }}
      >
        {/* Plain <img> so the GIF animates; no next/image. Image fills the container. */}
        <img
          src={gifSrc}
          alt="Clinix AI exploded device animation"
          className="absolute inset-0 w-full h-full object-contain rounded-2xl"
          style={{
            display: "block",
            opacity: 1,
            zIndex: 0,
          }}
          fetchPriority="high"
          onLoad={() => setLoadStatus("loaded")}
          onError={() => setLoadStatus("error")}
        />

        {/* Fallback when GIF fails to load — overlays image area only */}
        {loadStatus === "error" && (
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-[#0f0f10] border border-red-500/30 text-red-400/90 text-sm p-4 text-center"
            style={{ zIndex: 10 }}
            role="alert"
          >
            <p className="font-medium">GIF failed to load</p>
            <p className="mt-1 text-white/60">Check that the file exists at: {gifSrc}</p>
          </div>
        )}
      </div>

      {/* Temporary debug UI — remove or hide in production */}
      <div className="mt-3 flex flex-col gap-1 text-xs text-white/40 font-mono">
        <span>Rendering asset: {assetPath}</span>
        {loadStatus === "loaded" && <span className="text-emerald-500/80">GIF loaded</span>}
        {loadStatus === "error" && <span className="text-red-400/80">GIF failed to load</span>}
      </div>
    </div>
  );
}
