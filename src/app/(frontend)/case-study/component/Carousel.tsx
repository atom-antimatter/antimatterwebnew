"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import { Autoplay } from "swiper/modules";

export default function Carousel({ images }: { images: string[] }) {
  return (
    <div className="w-full overflow-visible">
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1}
        spaceBetween={20}
        loop={true}
        speed={2000}
        loopAddBlankSlides
        loopAdditionalSlides={2}
        breakpoints={{
          950: {
            slidesPerView: 2,
          },
        }}
        autoplay={{
          delay: 1500,
          disableOnInteraction: false,
        }}
        style={{ overflow: "visible" }}
      >
        {images.map((src, index) => (
          <SwiperSlide key={src}>
            <div className="relative w-full ">
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                width={1920}
                height={1080}
                className="object-contain rounded-xl"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
