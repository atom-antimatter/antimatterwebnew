"use client";

import { enterpriseAIPillarData } from "@/data/enterpriseAIPillars";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiOutlineArrowLongLeft, HiOutlineArrowLongRight } from "react-icons/hi2";
import EnterpriseAIPillarCard from "./EnterpriseAIPillarCard";

const EnterpriseAIPillarCardContainer = () => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stepPxRef = useRef<number>(420);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const measureStep = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("[data-card='0']");
    const second = el.querySelector<HTMLElement>("[data-card='1']");
    if (first && second) {
      const step = Math.max(1, second.offsetLeft - first.offsetLeft);
      stepPxRef.current = step;
    }
  }, []);

  const updateStateFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft;
    setCanScrollLeft(left > 2);
    setCanScrollRight(left < max - 2);
  }, []);

  useEffect(() => {
    measureStep();
    updateStateFromScroll();

    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        updateStateFromScroll();
      });
    };

    const onResize = () => {
      measureStep();
      updateStateFromScroll();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [measureStep, updateStateFromScroll]);

  const scrollByCard = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = stepPxRef.current || 420;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  return (
    <div id="enterprise-pillars-cards">
      {/* Controls row (outside cards) */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <button
          type="button"
          aria-label="Previous card"
          onClick={() => scrollByCard(-1)}
          disabled={!canScrollLeft}
          className={`h-10 w-10 rounded-full border border-foreground/25 bg-background/40 backdrop-blur transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/60 focus:ring-offset-2 focus:ring-offset-background ${
            canScrollLeft ? "hover:bg-background/70" : "opacity-40 cursor-default"
          }`}
        >
          <HiOutlineArrowLongLeft className="mx-auto size-5" />
        </button>
        <button
          type="button"
          aria-label="Next card"
          onClick={() => scrollByCard(1)}
          disabled={!canScrollRight}
          className={`h-10 w-10 rounded-full border border-foreground/25 bg-background/40 backdrop-blur transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/60 focus:ring-offset-2 focus:ring-offset-background ${
            canScrollRight ? "hover:bg-background/70" : "opacity-40 cursor-default"
          }`}
        >
          <HiOutlineArrowLongRight className="mx-auto size-5" />
        </button>
      </div>

      {/* Viewport */}
      <div
        ref={scrollerRef}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") scrollByCard(-1);
          if (e.key === "ArrowRight") scrollByCard(1);
        }}
        className="overflow-x-auto overflow-y-hidden scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
        aria-label="Enterprise AI Deployment cards"
      >
        {/* Track */}
        <div className="flex flex-nowrap gap-5 xl:gap-6 py-2 pr-10 md:pr-16 snap-x snap-mandatory">
          {enterpriseAIPillarData.map((card, idx) => (
            <div
              key={card.title}
              data-card={String(idx)}
              className="flex-none w-[340px] xl:w-[380px] 2xl:w-[460px] snap-start"
            >
              <EnterpriseAIPillarCard active={false} {...card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseAIPillarCardContainer;

