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

    // Listen to Lenis scroll events (only on desktop)
    if (!isMobile) {
      lenis.on("scroll", updateScrollTrigger);
    } else {
      // On mobile, use native scroll events since Lenis is disabled
      window.addEventListener("scroll", updateScrollTrigger, { passive: true });
    }

    // Initial refresh after mount
    ScrollTrigger.refresh();

    // Handle resize events
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    // Mobile-specific: disable smooth scroll on mobile to prevent conflicts
    if (isMobile) {
      // Disable Lenis smooth scroll on mobile to use native scrolling
      lenis.stop();
    }

    // Cleanup
    return () => {
      if (!isMobile) {
        lenis.off("scroll", updateScrollTrigger);
      } else {
        window.removeEventListener("scroll", updateScrollTrigger);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [lenis]);

  return null;
}
