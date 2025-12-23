"use client";

import { enterpriseAIPillarData } from "@/data/enterpriseAIPillars";
import { useCallback, useRef } from "react";
import { HiOutlineArrowLongLeft, HiOutlineArrowLongRight } from "react-icons/hi2";
import EnterpriseAIPillarCard from "./EnterpriseAIPillarCard";

const EnterpriseAIPillarCardContainer = () => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollByCard = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Roughly one card + gap; good enough and feels consistent across breakpoints.
    const step = 420;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  return (
    <div id="enterprise-pillars-cards">
      <div className="relative">
        {/* Left/Right buttons (desktop-first; still fine on smaller screens) */}
        <button
          type="button"
          aria-label="Scroll cards left"
          onClick={() => scrollByCard(-1)}
          className="hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full border border-foreground/25 bg-background/60 backdrop-blur hover:bg-background/80 transition-colors"
        >
          <HiOutlineArrowLongLeft className="size-6" />
        </button>
        <button
          type="button"
          aria-label="Scroll cards right"
          onClick={() => scrollByCard(1)}
          className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full border border-foreground/25 bg-background/60 backdrop-blur hover:bg-background/80 transition-colors"
        >
          <HiOutlineArrowLongRight className="size-6" />
        </button>

        {/* Viewport */}
        <div
          ref={scrollerRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Track */}
          <div className="flex flex-nowrap gap-5 xl:gap-6 py-2 pr-10 md:pr-16 snap-x snap-mandatory">
            {enterpriseAIPillarData.map((card) => (
              <div
                key={card.title}
                className="flex-none w-[340px] xl:w-[380px] 2xl:w-[460px] snap-start"
              >
                <EnterpriseAIPillarCard active={false} {...card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseAIPillarCardContainer;

