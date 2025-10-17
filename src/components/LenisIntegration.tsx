"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export function LenisIntegration() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Configure ScrollTrigger to work with Lenis
    ScrollTrigger.config({
      // Use Lenis's scroll position instead of native scroll
      ignoreMobileResize: true,
      // Disable native scroll refresh
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
    });

    // Sync Lenis scroll with ScrollTrigger
    const updateScrollTrigger = () => {
      ScrollTrigger.update();
    };

    // Listen to Lenis scroll events
    lenis.on("scroll", updateScrollTrigger);

    // Enhanced ScrollTrigger refresh with Lenis sync
    const refreshScrollTrigger = () => {
      // Temporarily stop Lenis during refresh
      lenis.stop();
      ScrollTrigger.refresh();
      // Restart Lenis after refresh
      setTimeout(() => lenis.start(), 100);
    };

    // Initial refresh after mount
    refreshScrollTrigger();

    // Handle resize events
    const handleResize = () => {
      refreshScrollTrigger();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      lenis.off("scroll", updateScrollTrigger);
      window.removeEventListener("resize", handleResize);
    };
  }, [lenis]);

  return null;
}
