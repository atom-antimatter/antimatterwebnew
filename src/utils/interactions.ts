"use client";
import { useLoading } from "@/store";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger, SplitText);

const Interactions = () => {
  const finished = useLoading((s) => s.finished);
  useEffect(() => {
    // Add any global interactions or animations here if needed
    if (!finished) return;
    
    // Check if particles3d exists (only on homepage)
    const particles3d = document.querySelector("#particles3d");
    if (!particles3d) return;
    
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          endTrigger: "#services",
          end: "center center",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      timeline
        .to("#hero-title", { duration: 1, ease: "power1.out", y: -150 }, 0)
        .to("#hero-company", { duration: 1, ease: "power1.out", y: 200 }, 0)
        .to(
          "#hero-stats",
          {
            duration: 0.6,
            delay: 0.05,
            ease: "power1.inOut",
            opacity: 0,
            y: 50,
          },
          0
        )
        .to("#hero-stats", { pointerEvents: "none", delay: 0.2 }, 0);
      const title1 = new SplitText("#title1", {
        type: "chars,lines",
        linesClass: "overflow-hidden py-3",
      });
      const title2 = new SplitText("#title2", {
        type: "chars,lines",
        linesClass: "overflow-hidden",
      });

      const tl1 = gsap.timeline();

      tl1.fromTo(
        "#particles3d",
        { scale: 0.5, opacity: 0 },
        { opacity: 1, scale: 1, duration: 2.5, delay: 0.8, ease: "back.out" },
        0
      );
      // Fade out particles when entering Work (Case Studies), and restore on scroll-up
      ScrollTrigger.create({
        trigger: "#work-section",
        start: "top bottom",
        end: "top 70%",
        scrub: true,
        onUpdate: (self) => {
          gsap.to("#particles3d", {
            opacity: 1 - self.progress,
            overwrite: "auto",
          });
        },
      });

      tl1.fromTo(
        title1.chars,
        { y: "100%", scale: 0.2 },
        {
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.04,
          ease: "back.out",
          delay: 0.3,
        },
        0
      );
      tl1.fromTo(
        title2.chars,
        { y: "100%", scale: 0.2 },
        {
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: -0.04,
          ease: "back.out",
          delay: 0.3,
        },
        0
      );
      return () => {
        title1.revert();
        title2.revert();
      };
    });
    return () => ctx.revert();
  }, [finished]);
  return null;
};

export default Interactions;
