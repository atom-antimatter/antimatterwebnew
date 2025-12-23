"use client";

import { enterpriseAIPillarData } from "@/data/enterpriseAIPillars";
import { useActiveIndex } from "@/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineArrowLongLeft,
  HiOutlineArrowLongRight,
} from "react-icons/hi2";
import "swiper/css";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperTypes } from "swiper/types";
import EnterpriseAIPillarCard from "./EnterpriseAIPillarCard";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const EnterpriseAIPillarCardContainer = () => {
  const activeIndex = useActiveIndex((state) => state.activeIndex);
  const setActiveIndex = useActiveIndex((state) => state.setActiveIndex);
  const [isBeginning, setIsBeginning] = useState(true);
  const [breakpoint, setBreakpoint] = useState("");
  const [isEnd, setIsEnd] = useState(false);

  const renderBullet = useCallback((index: number, className?: string) => {
    const safeClass =
      typeof className === "string" && className.trim().length > 0
        ? className
        : "swiper-pagination-bullet";

    const isActive = index === 0;
    const isNeighbor = index === 1;
    const extraClass = isActive ? "active" : isNeighbor ? "neighbor" : "";

    return `
        <span class="${safeClass} custom-bullet block w-1 h-7 bg-foreground/70 hover:bg-foreground mx-[3px]
          transition-transform duration-300 ${extraClass}"></span>
      `;
  }, []);

  const updateBullets = useCallback((swiper: SwiperTypes) => {
    const bullets = document.querySelectorAll(".custom-bullet");
    bullets.forEach((b, i) => {
      b.classList.remove("active", "neighbor");
      if (i === swiper.activeIndex) b.classList.add("active");
      if (i === swiper.activeIndex - 1 || i === swiper.activeIndex + 1)
        b.classList.add("neighbor");
    });
  }, []);

  const handleSlideChange = useCallback(
    (swiper: SwiperTypes) => {
      setActiveIndex(swiper.activeIndex);
      setIsBeginning(swiper.isBeginning);
      setIsEnd(swiper.isEnd);
      updateBullets(swiper);
    },
    [setActiveIndex, updateBullets]
  );

  // Desktop sticky horizontal scroll (wheel/vertical scroll drives X translation).
  const desktopOuterRef = useRef<HTMLDivElement | null>(null);
  const desktopStickyRef = useRef<HTMLDivElement | null>(null);
  const desktopTrackRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const scrollDistanceRef = useRef(0);
  const stepRef = useRef(0);
  const [outerHeightPx, setOuterHeightPx] = useState<number>(0);

  const desktopCards = useMemo(() => enterpriseAIPillarData, []);

  const measureDesktop = useCallback(() => {
    const outer = desktopOuterRef.current;
    const sticky = desktopStickyRef.current;
    const track = desktopTrackRef.current;
    if (!outer || !sticky || !track) return;

    const viewportW = sticky.clientWidth;
    const trackW = track.scrollWidth;
    const distance = Math.max(0, trackW - viewportW);
    scrollDistanceRef.current = distance;
    setOuterHeightPx(window.innerHeight + distance);

    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-pillar-card]"));
    if (cards.length >= 2) {
      stepRef.current = Math.max(1, cards[1].offsetLeft - cards[0].offsetLeft);
    } else {
      stepRef.current = 0;
    }
  }, []);

  const updateDesktop = useCallback(() => {
    const outer = desktopOuterRef.current;
    const track = desktopTrackRef.current;
    if (!outer || !track) return;

    const distance = scrollDistanceRef.current;
    if (distance <= 0) {
      track.style.transform = "translate3d(0,0,0)";
      return;
    }

    const rect = outer.getBoundingClientRect();
    const offset = clamp(-rect.top, 0, distance);
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;

    const step = stepRef.current;
    if (step > 0) {
      const nextIndex = clamp(Math.round(offset / step), 0, desktopCards.length - 1);
      if (nextIndex !== activeIndex) setActiveIndex(nextIndex);
    }
  }, [activeIndex, desktopCards.length, setActiveIndex]);

  useEffect(() => {
    // Only activate on large screens.
    const mq = window.matchMedia("(min-width: 1024px)");
    if (!mq.matches) return;

    measureDesktop();
    updateDesktop();

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        updateDesktop();
      });
    };

    const onResize = () => {
      measureDesktop();
      updateDesktop();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [measureDesktop, updateDesktop]);

  return (
    <div id="enterprise-pillars-cards">
      {/* Mobile/tablet: Swiper */}
      <div className="flex mb-8 justify-between items-center lg:hidden">
        <button
          aria-label="Previous slide"
          className={`px-5 border border-foreground/30 rounded-full transition-colors slider-prev ${
            isBeginning
              ? "opacity-30 pointer-events-none"
              : "hover:bg-foreground/10 cursor-pointer"
          }`}
        >
          <HiOutlineArrowLongLeft className="size-7 sm:size-10" />
        </button>

        <div className="slider-pagination flex cursor-pointer" />

        <button
          aria-label="Next slide"
          className={`px-5 border border-foreground/30 rounded-full transition-colors slider-next ${
            isEnd
              ? "opacity-30 pointer-events-none"
              : "hover:bg-foreground/10 cursor-pointer"
          }`}
        >
          <HiOutlineArrowLongRight className="size-7 sm:size-10" />
        </button>
      </div>

      <Swiper
        className="overflow-visible w-full lg:hidden"
        slidesPerView={1}
        slidesOffsetAfter={30}
        spaceBetween={5}
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: ".slider-next",
          prevEl: ".slider-prev",
        }}
        pagination={{
          el: ".slider-pagination",
          clickable: true,
          renderBullet:
            renderBullet ??
            ((_, className = "swiper-pagination-bullet") =>
              `<span class="${className}"></span>`),
        }}
        onSwiper={handleSlideChange}
        style={{ overflow: "visible" }}
        onBreakpoint={(point) => setBreakpoint(point.currentBreakpoint)}
        onSlideChange={handleSlideChange}
        touchRatio={2}
        threshold={2}
        touchAngle={60}
        allowTouchMove={true}
        simulateTouch={true}
        touchStartPreventDefault={false}
        touchMoveStopPropagation={false}
        resistance={true}
        resistanceRatio={0.5}
        longSwipesRatio={0.3}
        longSwipesMs={200}
        shortSwipes={true}
        breakpoints={{
          768: {
            slidesPerView: 2,
            spaceBetween: 5,
            slidesOffsetAfter: 0,
            allowTouchMove: true,
            simulateTouch: true,
            touchRatio: 2,
            threshold: 2,
            longSwipesRatio: 0.3,
          },
        }}
      >
        {enterpriseAIPillarData.map((card, index) => (
          <SwiperSlide key={card.title}>
            <div className="enterprise-pillar-card w-full shrink-0">
              <EnterpriseAIPillarCard active={activeIndex === index} {...card} />
            </div>
          </SwiperSlide>
        ))}
        {(breakpoint === "768" || breakpoint === "1300") && <SwiperSlide />}
      </Swiper>

      {/* Desktop: sticky horizontal traversal */}
      <div
        ref={desktopOuterRef}
        className="hidden lg:block relative"
        style={{ height: outerHeightPx ? `${outerHeightPx}px` : "100vh" }}
      >
        <div
          ref={desktopStickyRef}
          className="sticky top-28 xl:top-32 overflow-hidden w-full min-w-0"
        >
          <div
            ref={desktopTrackRef}
            className="flex flex-nowrap gap-5 xl:gap-6 will-change-transform min-w-0"
            style={{ transform: "translate3d(0,0,0)" }}
          >
            {desktopCards.map((card, index) => (
              <div
                key={card.title}
                data-pillar-card
                className="enterprise-pillar-card w-[340px] xl:w-[380px] 2xl:w-[460px] shrink-0 min-w-0"
              >
                <EnterpriseAIPillarCard active={activeIndex === index} {...card} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-bullet {
          transform-origin: center;
          transform: scaleY(0.6);
        }
        .custom-bullet:hover {
          transform: scaleY(1);
        }
        .custom-bullet.active {
          transform: scale(1.1);
          background: white;
        }
        .custom-bullet.neighbor {
          transform: scaleY(0.8);
        }

        /* Improve touch interaction on mobile */
        @media (max-width: 1023px) {
          #enterprise-pillars-cards .swiper {
            touch-action: manipulation !important;
          }
          #enterprise-pillars-cards .swiper-wrapper {
            touch-action: pan-y !important;
          }
          #enterprise-pillars-cards .swiper-slide {
            touch-action: pan-y !important;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
          }
          #enterprise-pillars-cards .swiper-slide * {
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            pointer-events: none;
          }
          #enterprise-pillars-cards .swiper-slide button,
          #enterprise-pillars-cards .swiper-slide a,
          #enterprise-pillars-cards .swiper-slide input {
            pointer-events: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default EnterpriseAIPillarCardContainer;

