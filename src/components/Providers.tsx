"use client";
import { ScrollRestoration } from "@/utils/scrollRestoration";
import PageTransition from "./ui/PageTransition";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configure GSAP ScrollTrigger for smooth scroll
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
      ignoreMobileResize: true,
    });

    return () => {
      ScrollTrigger.normalizeScroll(false);
    };
  }, []);

  return (
    <>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>{children}</main>
        </div>
      </div>
      <PageTransition />

      {/* Custom scroll restoration */}
      <ScrollRestoration />
    </>
  );
}
