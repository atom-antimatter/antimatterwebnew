"use client";

import Particles3D from "./Particles3D";
import { useEffect } from "react";
import gsap from "gsap";

/**
 * Static particles component for pages without scroll-driven animations
 * Always visible, centered in hero section, does not follow scroll
 * Uses absolute positioning to stay within hero container
 */
type Props = {
  /**
   * Use a custom DOM id to avoid collisions if rendered more than once
   * (e.g. desktop absolute + mobile inline).
   */
  id?: string;
  /**
   * Additional Tailwind classes for sizing/positioning.
   */
  className?: string;
  /**
   * When true, renders as a normal flow element (not absolute-centered).
   */
  inline?: boolean;
  /**
   * Lightweight fallback (no WebGL). Useful for mobile/reduced-motion.
   */
  lite?: boolean;
};

const ParticelsStatic = ({
  id = "particles3d-static",
  className = "",
  inline = false,
  lite = false,
}: Props) => {
  useEffect(() => {
    if (lite) return;
    // Ensure particles are visible and centered (no scroll animation)
    const particles = document.querySelector(`#${id}`);
    if (particles) {
      gsap.set(particles, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        clearProps: "transform" // Clear any inherited transforms but keep position
      });
    }
  }, [id, lite]);

  return (
    <div
      className={[
        inline
          ? "relative pointer-events-none z-10"
          : "absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10",
        className,
      ].join(" ")}
      id={id}
      style={{ opacity: 1 }} // Always visible
    >
      <div className="relative w-full h-full">
        {lite ? (
          <>
            <div className="absolute inset-0 rounded-full bg-white/5" />
            <div className="absolute inset-[18%] rounded-full bg-primary/35 blur-[70px]" />
            <div className="absolute inset-[30%] rounded-full bg-secondary/25 blur-[55px]" />
          </>
        ) : (
          <>
            <Particles3D />
            <div className="size-1/2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute bg-primary rounded-full blur-[100px]"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParticelsStatic;

