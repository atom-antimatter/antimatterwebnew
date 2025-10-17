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

    // Detect mobile device
    const isMobile = window.innerWidth < 768;
    
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

    // Listen to Lenis scroll events on all devices
    lenis.on("scroll", updateScrollTrigger);

    // Initial refresh after mount
    ScrollTrigger.refresh();

    // Handle resize events
    const handleResize = () => {
      ScrollTrigger.refresh();
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
