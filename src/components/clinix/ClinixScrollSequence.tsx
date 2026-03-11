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
  "ffmpeg -y -i public/clinix-exploded.gif -vsync 0 public/clinix-frames/frame_%04d.png";
const BACKGROUND_GIF = "/Website_Scroll_Video_Generation.gif";
const BACKGROUND_FALLBACK = "/clinix-device-background.jpg";

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

  // Load manifest and preload frame images
  useEffect(() => {
    let cancelled = false;
    loadFramesManifest()
      .then((data) => {
        if (cancelled || !data) {
          if (!data) {
            if (process.env.NODE_ENV === "development") {
              console.log("[ClinixScrollSequence] no manifest, showing fallback");
            }
            setFallback(true);
          }
          return;
        }
        const { totalFrames: n, frameUrls, firstFrameUrl } = data;
        setTotalFrames(n);
        if (process.env.NODE_ENV === "development") {
          console.log("[ClinixScrollSequence] manifest ok", {
            totalFrames: n,
            firstFrameUrl,
            frameUrlsSample: frameUrls.slice(0, 3),
          });
        }
        return preloadFrameImages(frameUrls).then((imgs) => ({ imgs, firstFrameUrl }));
      })
      .then((result) => {
        if (cancelled || !result || result.imgs.length === 0) return;
        const { imgs } = result;
        imagesRef.current = imgs;
        setFrameImages(imgs);
        if (process.env.NODE_ENV === "development") {
          console.log("[ClinixScrollSequence] preloaded", imgs.length, "frames; first frame loaded");
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const loadErr = err as LoadFramesError;
        if (loadErr?.failedUrls !== undefined) {
          setLoadError(loadErr);
          if (process.env.NODE_ENV === "development") {
            console.warn("[ClinixScrollSequence] preload failed", loadErr.failedUrls, loadErr.message);
          }
        }
        setFallback(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Update scroll progress (always) and draw current frame to canvas when we have a frame sequence
  const updateProgressAndFrame = useCallback(() => {
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
    const canvas = canvasRef.current;
    if (!canvas || !imgs?.length || imgs.length <= 1) return;

    const frameIndex = getFrameIndex(prog, imgs.length);
    const img = imgs[frameIndex];
    if (!img || !img.complete) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      if (process.env.NODE_ENV === "development" && frameIndex === 0) {
        console.warn("[ClinixScrollSequence] canvas getContext('2d') returned null");
      }
      return;
    }

    const cw = canvas.width;
    const ch = canvas.height;
    if (cw <= 0 || ch <= 0) {
      if (process.env.NODE_ENV === "development" && lastFrameIndexRef.current < 0) {
        console.warn("[ClinixScrollSequence] canvas has no dimensions", { cw, ch });
      }
      return;
    }

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

    if (process.env.NODE_ENV === "development") {
      if (lastFrameIndexRef.current !== frameIndex) {
        console.log("[ClinixScrollSequence] draw frame", {
          frameIndex,
          progress: prog.toFixed(3),
          canvasSize: [cw, ch],
          imageSize: [img.naturalWidth, img.naturalHeight],
        });
        lastFrameIndexRef.current = frameIndex;
      }
    }
  }, []);

  // Scroll listener
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
    updateProgressAndFrame();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateProgressAndFrame, frameImages]);

  // Resize canvas to sticky container and draw current frame
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
        if (process.env.NODE_ENV === "development") {
          console.log("[ClinixScrollSequence] canvas resize", { w, h, display: [rect.width, rect.height] });
        }
      }
      updateProgressAndFrame();
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    return () => ro.disconnect();
  }, [frameImages, updateProgressAndFrame]);

  // Fallback: no frames or load failed
  if (fallback) {
    return (
      <section
        ref={sectionRef}
        className="relative bg-[#0b0b0c] flex flex-col items-center justify-center min-h-[100vh] px-6 py-10 overflow-hidden"
      >
        {/* GIF or fallback image as full-screen background */}
        <div className="absolute inset-0 z-0">
          <img
            src={BACKGROUND_GIF}
            alt=""
            className="absolute inset-0 w-full h-full object-contain object-center"
            style={{ display: "block", minHeight: "100%", minWidth: "100%" }}
            fetchPriority="high"
            onError={(e) => {
              const el = e.currentTarget;
              if (el.src.includes("Website_Scroll_Video_Generation.gif")) {
                el.src = BACKGROUND_FALLBACK;
              }
            }}
          />
        </div>
        <div className="relative z-10 max-w-lg mx-auto text-center space-y-6">
          <p className="font-semibold text-amber-200">
            Frame sequence missing in {EXPECTED_FOLDER}
          </p>
          {/* Temporary test: verify first frame path works */}
          <div className="rounded-lg border border-white/20 overflow-hidden bg-black/40">
            <p className="text-xs text-white/60 py-2">Test: first frame at expected path</p>
            <img
              src={EXPECTED_FIRST_FRAME}
              alt="Frame test"
              className="max-h-48 w-auto mx-auto"
              onLoad={() => {
                if (process.env.NODE_ENV === "development") {
                  console.log("[ClinixScrollSequence] test img loaded:", EXPECTED_FIRST_FRAME);
                }
              }}
              onError={(e) => {
                if (process.env.NODE_ENV === "development") {
                  console.warn("[ClinixScrollSequence] test img failed:", EXPECTED_FIRST_FRAME, e);
                }
              }}
            />
          </div>
          {/* Debug panel */}
          <div className="text-left border border-amber-500/40 rounded-xl bg-[#0f0f10] p-4 text-amber-200/90 text-xs font-mono space-y-2">
            <p><strong>Expected folder:</strong> {EXPECTED_FOLDER}</p>
            <p><strong>Expected first frame:</strong> {EXPECTED_FIRST_FRAME}</p>
            {loadError && (
              <>
                <p><strong>Total frames (manifest):</strong> {loadError.totalFrames}</p>
                <p><strong>Load failed (sample):</strong> {(loadError.failedUrls ?? []).slice(0, 5).join(", ")}</p>
              </>
            )}
            <p className="pt-2 text-white/70">Generate frames:</p>
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
        {/* Video/GIF as full-screen background — always visible */}
        <div className="absolute inset-0 z-0" aria-hidden>
          <img
            src={BACKGROUND_GIF}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ display: "block", width: "100%", height: "100%" }}
            fetchPriority="high"
            onError={(e) => {
              const el = e.currentTarget;
              if (el.src.includes("Website_Scroll_Video_Generation.gif")) {
                el.src = BACKGROUND_FALLBACK;
              }
            }}
          />
        </div>
        {/* Canvas only when we have a multi-frame sequence for scroll-scrub; otherwise GIF shows through */}
        {frameImages && frameImages.length > 1 && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-[1]"
            style={{ background: "transparent", display: "block" }}
          />
        )}
        {/* Gradient so text stays readable over video throughout */}
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
