import ReactLenis from "lenis/react";
import { ScrollRestoration } from "@/utils/scrollRestoration";
import PageTransition from "./ui/PageTransition";
import { LenisIntegration } from "./LenisIntegration";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Check if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  
  return (
    <>
      {/* Lenis for smooth scrolling - disabled on mobile */}
      <ReactLenis root options={{ 
        duration: 1.2,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        lerp: 0.1,
        infinite: false,
        autoResize: true,
        // Disable smooth scroll on mobile
        ...(isMobile ? {
          smooth: false,
          duration: 0,
          lerp: 1
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
