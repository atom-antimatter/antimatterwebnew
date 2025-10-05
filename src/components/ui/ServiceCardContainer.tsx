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
  const [isEnd, setIsEnd] = useState(false);

  const renderBullet = useCallback(
    (index: number, className: string) => {
      const isActive = index === activeIndex;
      const isNeighbor = index === activeIndex - 1 || index === activeIndex + 1;

      const extraClass = isActive ? "active" : isNeighbor ? "neighbor" : "";

      return `<span class="${className} custom-bullet block w-1 h-7 bg-foreground/70 hover:bg-foreground mx-[3px] transition-transform duration-300 ${extraClass}"></span>`;
    },
    [activeIndex]
  );

  const updateBullets = useCallback(
    (swiper: SwiperTypes) => {
      const bullets = document.querySelectorAll(".custom-bullet");
      bullets.forEach((b, i) => {
        b.classList.remove("active", "neighbor");
        if (i === swiper.activeIndex) b.classList.add("active");
        if (i === swiper.activeIndex - 1 || i === swiper.activeIndex + 1)
          b.classList.add("neighbor");
      });
      setActiveIndex(swiper.activeIndex);
    },
    [setActiveIndex]
  );

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
          renderBullet,
        }}
        onSwiper={handleSlideChange}
        style={{ overflow: "visible" }}
        onSlideChange={handleSlideChange}
        breakpoints={{
          768: {
            slidesPerView: 2,
            spaceBetween: 5,
            slidesOffsetAfter: 0,
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
      `}</style>
    </div>
  );
};

export default ServiceCardContainer;
