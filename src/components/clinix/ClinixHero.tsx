"use client";

import Link from "next/link";
import ClinixExplodedMedia from "./ClinixExplodedMedia";

export default function ClinixHero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 px-6 sm:px-8 lg:px-16 py-20 lg:py-28 bg-[#0b0b0c]">
      {/* No overlay or absolute layer covering the media — keeps GIF visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 w-full max-w-7xl mx-auto items-center">
        {/* Left: copy — no initial opacity 0 so content is visible on first paint */}
        <div className="order-2 lg:order-1 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-white leading-[1.1] mb-6">
            AI infrastructure for modern medical practices.
          </h1>
          <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10">
            Clinix AI helps practices improve documentation, billing, revenue
            cycle performance, and operational workflows through intelligent
            automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              href="#"
              className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 rounded-full bg-white text-[#0b0b0c] font-medium text-base hover:bg-white/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0c]"
            >
              Request Demo
            </Link>
            <Link
              href="#architecture"
              className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 rounded-full border border-white/30 text-white font-medium text-base hover:bg-white/5 hover:border-white/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0c]"
            >
              Explore the Platform
            </Link>
          </div>
        </div>

        {/* Right: exploding device — simple GIF first; future: scroll-scrubbed frame sequence via ClinixExplodedMedia mode="frames" */}
        <div className="order-1 lg:order-2 w-full flex justify-center lg:justify-end min-w-0">
          <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
            <ClinixExplodedMedia mode="gif" gifSrc="/clinix-exploded.gif" />
          </div>
        </div>
      </div>
    </section>
  );
}
