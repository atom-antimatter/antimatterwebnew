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
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        lerp: 0.1,
        infinite: false,
        autoResize: true,
        syncTouch: true,
        syncTouchLerp: 0.1,
        touchInertiaMultiplier: 35
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
