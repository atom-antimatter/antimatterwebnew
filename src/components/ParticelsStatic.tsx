"use client";

import Particles3D from "./Particles3D";
import { useEffect } from "react";
import gsap from "gsap";

/**
 * Static particles component for pages without scroll-driven animations
 * Always visible, centered in hero section, does not follow scroll
 * Uses absolute positioning to stay within hero container
 */
const ParticelsStatic = () => {
  useEffect(() => {
    // Ensure particles are visible and centered (no scroll animation)
    const particles = document.querySelector("#particles3d-static");
    if (particles) {
      gsap.set(particles, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        clearProps: "transform" // Clear any inherited transforms but keep position
      });
    }
  }, []);

  return (
    <div
      className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] sm:size-[700px] 2xl:size-[900px] z-10"
      id="particles3d-static"
      style={{ opacity: 1 }} // Always visible
    >
      <div className="relative w-full h-full">
        <Particles3D />
        <div className="size-1/2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute bg-primary rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};

export default ParticelsStatic;

