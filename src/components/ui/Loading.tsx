"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  animate,
  AnimatePresence,
  useMotionValueEvent,
} from "framer-motion";
import { useLoading } from "@/store";
import { useShallow } from "zustand/shallow";

const Loading = () => {
  // ✅ Single subscription with shallow equality
  const { isLoading, finished, setFinished } = useLoading(
    useShallow((s) => ({
      isLoading: s.isLoading,
      finished: s.finished,
      setFinished: s.setFinished,
    }))
  );

  // Motion value for counter (0–100)
  const counterValue = useMotionValue(0);
  const [counter, setCounter] = useState(0);

  // Only fire "finish" once
  const finishedOnceRef = useRef(false);

  // Disable scroll while loader is active
  useEffect(() => {
    const body = document.body;
    // const prevOverflow = body.style.overflow;
    if (!finished) {
      body.style.overflow = "hidden";
    } else {
      body.style.overflowY = "auto";
    }
    return () => {
      body.style.overflowY = "auto";
    };
  }, [finished]);

  // 🔕 Only update React state when the rounded value actually changes
  const lastRoundedRef = useRef(0);
  useMotionValueEvent(counterValue, "change", (latest) => {
    const rounded = Math.round(latest);
    if (rounded !== lastRoundedRef.current) {
      lastRoundedRef.current = rounded;
      setCounter(rounded);

      if (rounded === 100 && !finishedOnceRef.current) {
        finishedOnceRef.current = true;
        // short delay to let the final animation settle
        setTimeout(() => setFinished(true), 400);
      }
    }
  });

  // Drive progress while loading; complete to 100 when done
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let controls: ReturnType<typeof animate> | null = null;

    const tick = () => {
      const current = counterValue.get();

      if (isLoading) {
        if (current < 50) {
          const rand = Math.floor(Math.random() * 10) + 5; // 5–14
          const next = Math.min(current + rand, 50);
          controls = animate(counterValue, next, {
            type: "tween",
            duration: 0.3,
            ease: "easeOut",
          });
        } else if (current < 90) {
          const rand = Math.floor(Math.random() * 3) + 1; // 1–3
          const next = Math.min(current + rand, 90);
          controls = animate(counterValue, next, {
            type: "tween",
            duration: 0.8,
            ease: "easeOut",
          });
        }
      }
    };

    if (isLoading) {
      intervalId = setInterval(tick, 600);
      // kick immediately so it doesn't wait 600ms on first render
      tick();
    } else {
      // Finish to 100 when loading ends
      controls = animate(counterValue, 100, {
        type: "spring",
        stiffness: 100,
        damping: 20,
      });
      if (intervalId) clearInterval(intervalId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      controls?.stop();
    };
  }, [isLoading, counterValue]);

  // Measure box width via ResizeObserver (less work than ref-callback churn)
  const [box2Width, setBox2Width] = useState(0);
  const [box2Height, setBox2Height] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // track mobile viewport
    if (typeof window !== "undefined") {
      const mql = window.matchMedia("(max-width: 640px)");
      const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
      setIsMobile(mql.matches);
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    }
  }, []);

  useEffect(() => {
    if (!boxRef.current || typeof ResizeObserver === "undefined") return;
    const el = boxRef.current;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry?.contentRect?.width) {
        setBox2Width(Math.round(entry.contentRect.width));
        setBox2Height(Math.round(entry.contentRect.height));
      } else {
        setBox2Width(el.offsetWidth);
        setBox2Height(el.offsetHeight);
      }
    });
    ro.observe(el);
    // initialize immediately
    setBox2Width(el.offsetWidth);
    setBox2Height(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const padding = 8; // Tailwind p-2
  const maxCrossSize = useMemo(() => {
    // minimize layout work by recomputing only when inputs change
    if (isMobile) {
      return `max(${100 - counter}%, ${box2Height + padding * 2}px)`;
    }
    return `max(${100 - counter}%, ${box2Width + padding * 2}px)`;
  }, [isMobile, counter, box2Width, box2Height]);

  // Mobile-only: grow loader height up to 100vh at 100%
  const mobileHeightVh = useMemo(() => {
    if (!isMobile) return undefined as unknown as string;
    const pct = Math.min(100, Math.max(0, counter));
    return `${pct}vh`;
  }, [isMobile, counter]);

  return (
    <AnimatePresence>
      {!finished && (
        <motion.div
          key="loading-screen"
          className="fixed left-0 top-0 bg-background z-99 w-screen h-screen px-10 py-10 flex"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <h2 className="absolute top-30 left-1/2 -translate-x-1/2 text-[14vw] font-bold text-nowrap text-center opacity-5">
            ANTIMATTER AI
          </h2>

          <div className="relative h-full flex-1">
            <motion.div
              className={`${isMobile ? "absolute rounded-3xl bottom-0 left-0" : "absolute rounded-3xl top-0 right-0"} bg-zinc-900 w-full h-full p-2 ${isMobile ? "will-change-[max-height]" : "will-change-[max-width]"}`}
              initial={isMobile ? { maxHeight: "0vh" } : { maxWidth: "100%" }}
              animate={isMobile ? { maxHeight: mobileHeightVh } : { maxWidth: maxCrossSize }}
              exit={isMobile ? { y: 500 } : { x: 500 }}
              transition={{
                type: "spring",
                stiffness: 80,
                damping: 30,
                duration: 0.6,
              }}
            >
              <div className="relative h-full">
                <div
                  ref={boxRef}
                  className={`${isMobile ? "w-full h-96" : "w-96 h-full"} bg-gradient-to-b from-background to-primary rounded-3xl flex flex-col justify-between p-5`}
                >
                  <div className="flex">
                    <span className="text-8xl tracking-tighter">
                      {counter}%
                    </span>
                  </div>
                  <div className="uppercase text-4xl text-foreground font-light">
                    Loading...
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
