"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getFrameIndex, getScrollProgress } from "@/lib/clinix/getScrollProgress";
import {
  loadFramesManifest,
  preloadFrameImages,
  type LoadFramesError,
} from "@/lib/clinix/loadFrames";
import ClinixOverlayCopy from "./ClinixOverlayCopy";

const SECTION_HEIGHT_VH = 500;
const EXPECTED_FOLDER = "/public/clinix-frames/";
const EXPECTED_FIRST_FRAME = "/clinix-frames/frame_0001.png";
const EXTRACTION_CMD =
  "ffmpeg -y -i public/Website_Scroll_Video_Generation.gif -vsync 0 public/clinix-frames/frame_%04d.png";

export default function ClinixScrollSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [frameImages, setFrameImages] = useState<HTMLImageElement[] | null>(null);
  const [totalFrames, setTotalFrames] = useState(0);
  const [fallback, setFallback] = useState(false);
  const [loadError, setLoadError] = useState<LoadFramesError | null>(null);
  const rafRef = useRef<number>(0);
  const imagesRef = useRef<HTMLImageElement[] | null>(null);
  const lastFrameIndexRef = useRef<number>(-1);

  // Load manifest and preload frame images once (no autoplay, no time-based logic)
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
        return preloadFrameImages(frameUrls).then((imgs) => ({ imgs }));
      })
      .then((result) => {
        if (cancelled || !result || result.imgs.length === 0) return;
        const { imgs } = result;
        imagesRef.current = imgs;
        setFrameImages(imgs);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const loadErr = err as LoadFramesError;
        if (loadErr?.failedUrls !== undefined) setLoadError(loadErr);
        setFallback(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Draw a single frame to canvas (used by scroll handler and initial paint). Only redraws if frameIndex changed.
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const imgs = imagesRef.current;
    if (!canvas || !imgs?.length) return;

    const idx = Math.max(0, Math.min(frameIndex, imgs.length - 1));
    const img = imgs[idx];
    if (!img || !img.complete) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    if (cw <= 0 || ch <= 0) return;

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2);
    const displayW = Math.floor(cw / dpr);
    const displayH = Math.floor(ch / dpr);
    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    ctx.scale(dpr, dpr);
    const scale = Math.min(displayW / img.naturalWidth, displayH / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const x = (displayW - drawW) / 2;
    const y = (displayH - drawH) / 2;
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, drawW, drawH);
    ctx.restore();
    lastFrameIndexRef.current = idx;
  }, []);

  // Scroll-driven update: compute progress -> frameIndex, only redraw when frameIndex changes
  const updateFrame = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionHeight = section.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const prog = getScrollProgress(sectionTop, sectionHeight, viewportHeight, scrollY);
    setProgress(prog);

    const imgs = imagesRef.current;
    const total = imgs?.length ?? 0;
    if (total === 0) return;

    const frameIndex = getFrameIndex(prog, total);
    if (frameIndex === lastFrameIndexRef.current) return;

    drawFrame(frameIndex);
  }, [drawFrame]);

  // Scroll listener only — no autoplay, no rAF animation loop
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => {
          updateFrame();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    updateFrame();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateFrame, frameImages]);

  // Resize canvas to sticky container; after resize, redraw current frame
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = stickyRef.current ?? sectionRef.current;
    if (!canvas || !container) return;

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);
      if (w <= 0 || h <= 0) return;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      }
      const imgs = imagesRef.current;
      if (imgs?.length) {
        const section = sectionRef.current;
        if (section) {
          const st = rect.top + window.scrollY;
          const sh = section.offsetHeight;
          const prog = getScrollProgress(st, sh, window.innerHeight, window.scrollY);
          drawFrame(getFrameIndex(prog, imgs.length));
        } else {
          drawFrame(0);
        }
      }
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    return () => ro.disconnect();
  }, [frameImages, drawFrame]);

  // First frame on load: draw frame 0 as soon as we have images and canvas has size
  useEffect(() => {
    const imgs = imagesRef.current;
    const canvas = canvasRef.current;
    if (!imgs?.length || !canvas || canvas.width <= 0 || canvas.height <= 0) return;
    if (lastFrameIndexRef.current >= 0) return;
    drawFrame(0);
  }, [frameImages, drawFrame]);

  // Fallback: no autoplay media — instructions only
  if (fallback) {
    return (
      <section
        ref={sectionRef}
        className="relative bg-[#0b0b0c] flex flex-col items-center justify-center min-h-[100vh] px-6 py-10"
      >
        <div className="relative z-10 max-w-lg mx-auto text-center space-y-6">
          <p className="font-semibold text-amber-200">
            Frame sequence missing in {EXPECTED_FOLDER}
          </p>
          <div className="rounded-lg border border-white/20 overflow-hidden bg-black/40">
            <p className="text-xs text-white/60 py-2">First frame test</p>
            <img src={EXPECTED_FIRST_FRAME} alt="Frame test" className="max-h-48 w-auto mx-auto" onError={() => {}} />
          </div>
          <div className="text-left border border-amber-500/40 rounded-xl bg-[#0f0f10] p-4 text-amber-200/90 text-xs font-mono space-y-2">
            <p><strong>Expected folder:</strong> {EXPECTED_FOLDER}</p>
            <p><strong>Expected first frame:</strong> {EXPECTED_FIRST_FRAME}</p>
            {loadError && (
              <>
                <p><strong>Total frames (manifest):</strong> {loadError.totalFrames}</p>
                <p><strong>Load failed (sample):</strong> {(loadError.failedUrls ?? []).slice(0, 5).join(", ")}</p>
              </>
            )}
            <p className="pt-2 text-white/70">Generate frames (scroll-driven, no autoplay):</p>
            <pre className="bg-black/50 p-2 rounded break-all text-[10px]">{EXTRACTION_CMD}</pre>
            <p className="text-white/50">Or run: ./scripts/extract-clinix-frames.sh</p>
          </div>
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
      <div
        ref={stickyRef}
        data-sticky-inner
        className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden bg-[#0b0b0c]"
      >
        {/* Scroll-driven frame sequence only — no GIF, no video, no autoplay */}
        {frameImages && frameImages.length >= 1 && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-[1]"
            style={{ background: "#0b0b0c", display: "block" }}
          />
        )}
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          aria-hidden
          style={{
            background:
              "linear-gradient(to top, rgba(11,11,12,0.92) 0%, rgba(11,11,12,0.4) 40%, transparent 70%)",
          }}
        />
        <ClinixOverlayCopy progress={progress} />
      </div>
    </section>
  );
}
