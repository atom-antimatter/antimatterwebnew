import ReactLenis from "lenis/react";
import { ScrollRestoration } from "@/utils/scrollRestoration";
import PageTransition from "./ui/PageTransition";
import { LenisIntegration } from "./LenisIntegration";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Lenis for smooth scrolling */}
      <ReactLenis root options={{ 
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        normalizeWheel: true,
        lerp: 0.1,
        infinite: false,
        autoResize: true,
        prevent: (node) => node.hasAttribute('data-lenis-prevent'),
        // Mobile-specific fixes
        touchInertiaMultiplier: 35,
        wheelInertiaMultiplier: 35,
        // Disable on mobile if problematic
        ...(typeof window !== 'undefined' && window.innerWidth < 768 ? {
          smooth: false, // Disable smooth scroll on mobile to prevent glitching
          duration: 0,
        } : {})
      }}>
        <main>{children}</main>
        <LenisIntegration />
      </ReactLenis>
      <PageTransition />

      {/* Custom scroll restoration */}
      <ScrollRestoration />
    </>
  );
}
