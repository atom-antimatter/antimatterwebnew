"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getFrameIndex, getScrollProgress } from "@/lib/clinix/getScrollProgress";
import { loadFramesManifest, preloadFrameImages } from "@/lib/clinix/loadFrames";
import ClinixOverlayCopy from "./ClinixOverlayCopy";

const SECTION_HEIGHT_VH = 500;
const FALLBACK_MESSAGE =
  "Frame sequence missing: generate frames from /public/clinix-exploded.gif. Run: ./scripts/extract-clinix-frames.sh";

export default function ClinixScrollSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [frameImages, setFrameImages] = useState<HTMLImageElement[] | null>(null);
  const [totalFrames, setTotalFrames] = useState(0);
  const [fallback, setFallback] = useState(false);
  const [firstFrameDrawn, setFirstFrameDrawn] = useState(false);
  const rafRef = useRef<number>(0);
  const imagesRef = useRef<HTMLImageElement[] | null>(null);

  // Load manifest and preload frame images
  useEffect(() => {
    let cancelled = false;
    loadFramesManifest()
      .then((data) => {
        if (cancelled || !data) {
          if (!data) setFallback(true);
          return;
        }
        const { totalFrames: n, frameUrls } = data;
        setTotalFrames(n);
        if (process.env.NODE_ENV === "development") {
          console.log("[ClinixScrollSequence] totalFrames:", n);
        }
        return preloadFrameImages(frameUrls);
      })
      .then((imgs) => {
        if (cancelled || !imgs || imgs.length === 0) return;
        imagesRef.current = imgs;
        setFrameImages(imgs);
        if (process.env.NODE_ENV === "development") {
          console.log("[ClinixScrollSequence] preloaded", imgs.length, "frames");
        }
      })
      .catch(() => setFallback(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll listener: compute progress and frame index, draw frame
  const updateProgressAndFrame = useCallback(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const imgs = imagesRef.current;
    if (!section || !canvas || !imgs?.length) return;

    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionHeight = section.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const prog = getScrollProgress(sectionTop, sectionHeight, viewportHeight, scrollY);
    setProgress(prog);

    const frameIndex = getFrameIndex(prog, imgs.length);
    if (process.env.NODE_ENV === "development" && Math.random() < 0.02) {
      console.log("[ClinixScrollSequence] progress:", prog.toFixed(3), "frameIndex:", frameIndex);
    }

    const img = imgs[frameIndex];
    if (!img || !img.complete) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const w = canvas.width;
    const h = canvas.height;
    const displayW = Math.floor(w / dpr);
    const displayH = Math.floor(h / dpr);
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.scale(dpr, dpr);
    const scale = Math.min(displayW / img.width, displayH / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const x = (displayW - drawW) / 2;
    const y = (displayH - drawH) / 2;
    ctx.drawImage(img, 0, 0, img.width, img.height, x, y, drawW, drawH);
    ctx.restore();

    if (!firstFrameDrawn) {
      setFirstFrameDrawn(true);
      if (process.env.NODE_ENV === "development") {
        console.log("[ClinixScrollSequence] first frame drawn");
      }
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => {
          updateProgressAndFrame();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial paint
    updateProgressAndFrame();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateProgressAndFrame, frameImages]);

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const sticky = section.querySelector("[data-sticky-inner]") as HTMLElement | null;
    const container = sticky || section;
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        updateProgressAndFrame();
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [frameImages, updateProgressAndFrame]);

  if (fallback) {
    return (
      <section
        ref={sectionRef}
        className="relative bg-[#0b0b0c] flex items-center justify-center min-h-[100vh] px-6"
      >
        <div className="max-w-md mx-auto text-center border border-amber-500/40 rounded-2xl bg-[#0f0f10] p-8 text-amber-200/90 text-sm">
          <p className="font-medium">{FALLBACK_MESSAGE}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0b0b0c]"
      style={{ height: `${SECTION_HEIGHT_VH}vh` }}
    >
      {/* Sticky viewport: stays pinned while we scroll through the section */}
      <div
        data-sticky-inner
        className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Canvas: full size of sticky area */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ background: "#0b0b0c" }}
        />
        {/* Subtle gradient at bottom so overlay text is readable */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          aria-hidden
          style={{
            background:
              "linear-gradient(to top, rgba(11,11,12,0.85) 0%, transparent 50%, transparent 100%)",
          }}
        />
        <ClinixOverlayCopy progress={progress} />
      </div>
    </section>
  );
}
