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
    
    const isMobile = window.innerWidth < 1024;
    
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

    // Only listen to Lenis on desktop, use native scroll on mobile
    if (!isMobile) {
      lenis.on("scroll", updateScrollTrigger);
    } else {
      // On mobile, use native scroll events
      window.addEventListener("scroll", updateScrollTrigger, { passive: true });
    }

    // Initial refresh after mount
    ScrollTrigger.refresh();

    // Handle resize events
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

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
