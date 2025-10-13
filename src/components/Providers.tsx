"use client";
import ReactLenis from "lenis/react";
import { ScrollRestoration } from "@/utils/scrollRestoration";
import PageTransition from "./ui/PageTransition";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Providers({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    if (lenisRef.current) {
      // Integrate Lenis with GSAP ScrollTrigger
      lenisRef.current.on("scroll", ScrollTrigger.update);
      
      gsap.ticker.add((time) => {
        lenisRef.current?.raf(time * 1000);
      });
      
      gsap.ticker.lagSmoothing(0);
    }
  }, []);

  return (
    <>
      {/* Lenis for smooth scrolling */}
      <ReactLenis 
        root 
        ref={lenisRef}
        options={{ 
          duration: 1.2,
        }}
      >
        <main>{children}</main>
      </ReactLenis>
      <PageTransition />

      {/* Custom scroll restoration */}
      <ScrollRestoration />
    </>
  );
}
