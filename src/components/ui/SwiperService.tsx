import "swiper/css";
import { useState, useCallback, NamedExoticComponent } from "react";
import {
  HiOutlineArrowLongLeft,
  HiOutlineArrowLongRight,
} from "react-icons/hi2";
import { Navigation, Pagination } from "swiper/modules";
import { SwiperSlide, Swiper } from "swiper/react";
import type { Swiper as SwiperTypes } from "swiper/types";
import { ServiceCardProps } from "./ServiceCard";
import { useActiveIndex } from "@/store";

interface Props {
  serviceCardData: ServiceCardProps[];
  MemoizedServiceCard: NamedExoticComponent<ServiceCardProps>;
  activeIndex: number;
}

const SwiperService = ({
  serviceCardData,
  MemoizedServiceCard,
  activeIndex,
}: Props) => {
  const setActiveIndex = useActiveIndex((state) => state.setActiveIndex);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [breakpoint, setBreakpoint] = useState("");

  //  Bullet rendering moved fully into React
  const renderBullet = useCallback(
    (index: number, className: string) => {
      let extraClass = "";
      if (index === activeIndex) extraClass = "active";
      else if (index === activeIndex - 1 || index === activeIndex + 1)
        extraClass = "neighbor";

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
    [updateBullets, setActiveIndex]
  );
  return (
    <>
      {/* Navigation & Pagination */}
      <div className="flex mb-8 justify-between items-center">
        <div
          className={`px-5 border border-foreground/30 rounded-full transition-colors slider-prev
          ${
            isBeginning
              ? "opacity-30 pointer-events-none"
              : "hover:bg-foreground/10 cursor-pointer"
          }`}
        >
          <HiOutlineArrowLongLeft className="size-7 sm:size-10" />
        </div>

        <div className="slider-pagination flex cursor-pointer"></div>

        <div
          className={`px-5 border border-foreground/30 rounded-full transition-colors slider-next
          ${
            isEnd
              ? "opacity-30 pointer-events-none"
              : "hover:bg-foreground/10 cursor-pointer"
          }`}
        >
          <HiOutlineArrowLongRight className="size-7 sm:size-10" />
        </div>
      </div>

      {/* Swiper */}
      <Swiper
        className="overflow-visible w-full"
        slidesPerView={1}
        slidesOffsetAfter={30}
        modules={[Navigation, Pagination]}
        spaceBetween={5}
        navigation={{
          nextEl: ".slider-next",
          prevEl: ".slider-prev",
        }}
        pagination={{
          el: ".slider-pagination",
          clickable: true,
          renderBullet,
        }}
        onSwiper={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
          updateBullets(swiper);
        }}
        onSlideChange={handleSlideChange}
        onBreakpoint={(point) => setBreakpoint(point.currentBreakpoint)}
        style={{ overflow: "visible" }}
        breakpoints={{
          768: {
            slidesPerView: 2,
            slidesOffsetAfter: 0,
            spaceBetween: 5,
          },
          1024: {
            slidesPerView: 1,
            slidesOffsetAfter: 200,
          },
          1300: {
            slidesPerView: 2,
            slidesOffsetAfter: 30,
          },
        }}
        centerInsufficientSlides={true}
      >
        {serviceCardData.map((card, index) => (
          <SwiperSlide key={card.title}>
            <div
              className={`
                transition-all duration-500 ease-in-out
                ${index < activeIndex && "scale-0 opacity-0"}
                ${index === activeIndex && "scale-100 z-10"}
                ${index > activeIndex && "scale-100 opacity-100"}
              `}
              style={{ transformOrigin: "center" }}
            >
              <MemoizedServiceCard active={activeIndex === index} {...card} />
            </div>
          </SwiperSlide>
        ))}

        {/* Avoid unnecessary empty slide */}
        {(breakpoint === "768" || breakpoint === "1300") && (
          <SwiperSlide></SwiperSlide>
        )}
      </Swiper>

      {/* Bullet styles */}
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
    </>
  );
};

export default SwiperService;
