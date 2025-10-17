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
    }

    // Initial refresh after mount
    ScrollTrigger.refresh();

    // Handle resize events
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    // Mobile-specific: prevent touch events from interfering
    if (isMobile) {
      const preventOverscroll = (e: TouchEvent) => {
        const target = e.target as Element;
        if (target.closest('[data-lenis-prevent]')) return;
        
        const container = document.documentElement;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const height = container.clientHeight;
        const wheelDelta = e.touches[0].clientY;
        
        if (wheelDelta < 0 && scrollTop === 0) {
          e.preventDefault();
        } else if (wheelDelta > 0 && scrollTop + height >= scrollHeight) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchmove', preventOverscroll, { passive: false });
      
      return () => {
        document.removeEventListener('touchmove', preventOverscroll);
        window.removeEventListener("resize", handleResize);
      };
    }

    // Cleanup
    return () => {
      lenis.off("scroll", updateScrollTrigger);
      window.removeEventListener("resize", handleResize);
    };
  }, [lenis]);

  return null;
}
