"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type BreakTitleProps = {
  text: string;
  align?: "left" | "center" | "right";
  className?: string;
};

// Word-by-word reveal on scroll. No external SplitText plugin required.
export default function BreakTitle({ text, align = "left", className = "" }: BreakTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const targets = containerRef.current.querySelectorAll("span[data-word]");
    const isMobile = window.innerWidth < 1024;
    const ctx = gsap.context(() => {
      gsap.to(targets, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        force3D: true,
        duration: 1.0,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: containerRef.current!,
          start: isMobile ? "top 95%" : "top 85%",
          once: true,
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  const justify = align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";

  return (
    <h2
      ref={containerRef}
      className={`text-3xl sm:text-title/tight font-semibold leading-tight ${alignClass} ${className}`}
    >
      <span className={`inline-flex flex-wrap ${justify} gap-x-2 gap-y-1`}>
        {words.map((w, i) => (
          <span
            key={`${w}-${i}`}
            data-word
            className="inline-block will-change-transform opacity-0"
            style={{ transform: "translateY(28px) rotateX(-18deg)" }}
          >
            {w}
          </span>
        ))}
      </span>
    </h2>
  );
}


