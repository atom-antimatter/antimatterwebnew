"use client";

import HeroComponent from "./ui/HeroComponent";
import { useEffect, useRef, useState } from "react";

const HeroSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // Supabase CDN video URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ailcmdpnkzgwvwsnxlav.supabase.co';
  const videoUrl = `${supabaseUrl}/storage/v1/object/public/media/videobg2`;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked - fallback to poster
      });
    }
  }, []);

  return (
    <div className="relative w-full h-screen z-40 overflow-hidden px-4 md:px-8 pt-24 md:pt-32" id="hero-section">
      {/* Video Container with Rounded Corners */}
      <div className="relative w-full h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl">
        {/* Video Background with CDN delivery */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          poster="/images/HeroOpenGraph.png"
        >
          <source src={videoUrl} type="video/mp4" />
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
