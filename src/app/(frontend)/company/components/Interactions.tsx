"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { motion } from "motion/react";
import { PropsWithChildren, useEffect } from "react";

gsap.registerPlugin(ScrollTrigger, SplitText);

const Interactions = () => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tagline = new SplitText("#tagline,#summary", {
        type: "lines",
        mask: "lines",
      });

      gsap.fromTo(
        tagline.lines,
        {
          yPercent: 150,
          rotate: 4,
        },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: "power2.out",
          stagger: 0.1,
          delay: 0.4,
        }
      );

      const story = new SplitText("#story-text", {
        type: "lines",
        linesClass: "overflow-hidden max-w-0 text-nowrap",
      });

      const storyTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#story-container",
          start: "+=10 bottom",
          end: "bottom center",
          scrub: true,
        },
      });
      story.lines.forEach((line, i) => {
        storyTl.fromTo(
          line,
          { maxWidth: "0px" },
          { maxWidth: "100%", duration: 1 },
          i * 0.7
        );
      });

      const paragraph = new SplitText("#story-paragraph", {
        type: "lines",
        mask: "lines",
      });

      gsap.from(paragraph.lines, {
        yPercent: 150,
        rotate: 4,
        stagger: 0.1,
        ease: "power2.out",
        duration: 0.8,
        scrollTrigger: {
          trigger: "#story-paragraph",
          start: "top 80%",
          once: true,
        },
      });

      return () => {
        tagline.revert();
      };
    });
    return () => ctx.revert();
  }, []);
  return null;
};

export default Interactions;

export const AccentMapAnim = ({ children }: PropsWithChildren) => {
  return (
    <motion.div
      initial={{ clipPath: "circle(100% at 50% 50%)" }}
      whileInView={{ clipPath: "circle(0% at 48% 73%)" }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      viewport={{ once: true, amount: 0.8, margin: "30px" }}
      className="absolute top-0 left-0 w-full h-full"
    >
      {children}
    </motion.div>
  );
};
