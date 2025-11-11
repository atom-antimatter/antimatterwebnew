"use client";

import HeroComponent from "./ui/HeroComponent";
import { useEffect, useRef, useState } from "react";

const HeroSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked - that's okay, video will show as poster
      });
    }
  }, []);

  return (
    <div className="relative w-full h-screen z-40 overflow-hidden px-4 md:px-8 pt-24 md:pt-32" id="hero-section">
      {/* Video Container with Rounded Corners */}
      <div className="relative w-full h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] rounded-[24px] md:rounded-[32px] overflow-hidden">
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          poster="/images/HeroOpenGraph.png"
        >
          <source src="/videobg2.mp4" type="video/mp4" />
        </video>

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        {/* Content Overlay */}
        <div className="relative z-20 h-full">
          <HeroComponent />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
