"use client";

import HeroComponent from "./ui/HeroComponent";

const HeroSection = () => {
  return (
    <div className="relative w-full h-screen z-40 overflow-hidden px-4 md:px-8 pt-24 md:pt-32" id="hero-section">
      {/* Hero Container with Rounded Corners */}
      <div className="relative w-full h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl">
        {/* Background Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('/images/HeroOpenGraph.png')" }}
        />

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
