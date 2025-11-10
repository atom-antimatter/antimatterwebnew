"use client";

import { serviceCardData } from "@/data/servicesHome";
import { useActiveIndex } from "@/store";
import { useCallback, useState } from "react";
import {
  HiOutlineArrowLongLeft,
  HiOutlineArrowLongRight,
} from "react-icons/hi2";
import "swiper/css";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperTypes } from "swiper/types";
import ServiceCard from "./ServiceCard";

const ServiceCardContainer = () => {
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

  return (
    <div id="service-cards">
      {/* Navigation */}
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

      {/* Swiper */}
      <Swiper
        className="overflow-visible w-full"
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
          1024: {
            slidesPerView: "auto",
            allowTouchMove: false,
            simulateTouch: false,
            pagination: false,
            navigation: false,
            slidesOffsetAfter: 0,
            spaceBetween: 0,
          },
        }}
      >
        {serviceCardData.map((card, index) => (
          <SwiperSlide
            key={card.title}
            className="lg:!w-auto transition-all duration-500 ease-in-out"
          >
            <div
              className={`
                transition-all duration-500 ease-in-out
                service-card w-full lg:w-[340px] xl:w-[380px] 2xl:w-[460px] shrink-0 
              `}
            >
              <ServiceCard active={activeIndex === index} {...card} />
            </div>
          </SwiperSlide>
        ))}
        {/* Avoid unnecessary empty slide */}
        {(breakpoint === "768" || breakpoint === "1300") && (
          <SwiperSlide></SwiperSlide>
        )}
      </Swiper>

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
          #service-cards .swiper {
            touch-action: manipulation !important;
          }
          #service-cards .swiper-wrapper {
            touch-action: pan-y !important;
          }
          #service-cards .swiper-slide {
            touch-action: pan-y !important;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
          }
          #service-cards .swiper-slide * {
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            pointer-events: none;
          }
          #service-cards .swiper-slide button,
          #service-cards .swiper-slide a,
          #service-cards .swiper-slide input {
            pointer-events: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceCardContainer;
