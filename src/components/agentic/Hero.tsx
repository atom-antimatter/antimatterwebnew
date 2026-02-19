"use client";

import { HiMiniArrowLongRight } from "react-icons/hi2";
import { motion } from "motion/react";
import Image from "next/image";
import { useRef, useState, useEffect, type ReactNode } from "react";
import RotatingCards, { type Card } from "./RotatingCards";

const easeOut = [0.16, 1, 0.3, 1] as const;
const headlineText = "AntimatterAI: The Nervous System + Spine for Deployed AI";

const cardData = [
  { label: "Grok (xAI)", image: "/img/chrome-extension.webp" },
  { label: "ChatGPT (OpenAI)", image: "/img/safari-extension.webp" },
  { label: "Claude (Anthropic)", image: "/img/api-access.webp" },
  { label: "Voice Agents", image: "/img/article-summary.webp" },
  { label: "Workflow Agents", image: "/img/video-summary.webp" },
  { label: "Enterprise Security", image: "/img/podcast-summary.webp" },
  { label: "Model-agnostic orchestration", image: "/img/pdf-summary.webp" },
  { label: "Compliance-ready by design", image: "/img/research-papers.webp" },
  { label: "Regulated ops focus", image: "/img/social-threads.webp" },
  { label: "Full observability + replay", image: "/img/email-digest.webp" },
  { label: "Governed execution", image: "/img/book-summary.webp" },
];

const carouselCards: Card[] = cardData.map((card, index) => ({
  id: index + 1,
  content: (
    <div className="flex h-full flex-col p-2">
      <div className="relative flex-1 overflow-hidden rounded-t-sm rounded-b-full">
        <Image
          src={card.image}
          alt={card.label}
          fill
          className="object-cover grayscale"
        />
      </div>
      <div className="px-1 pt-3 text-center">
        <span className="text-sm font-medium">{card.label}</span>
      </div>
    </div>
  ),
}));

export function Hero(): ReactNode {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener("mousemove", handleMouseMove);
      return () => section.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-dvh flex-col items-center justify-start overflow-hidden px-6 pt-40 sm:pt-82"
      style={{
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(162, 163, 233, 0.15), transparent 40%)`,
      }}
    >
      <div ref={headlineRef} className="relative z-10 mx-auto md:text-center">
        <h1 className="mb-8 text-5xl font-medium tracking-tighter md:text-8xl lg:text-8xl">
          {headlineText.split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{
                duration: 0.4,
                delay: index * 0.03,
                ease: "easeOut",
              }}
              className="inline-block"
              style={{ whiteSpace: char === " " ? "pre" : "normal" }}
            >
              {char}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.8,
            ease: "easeOut",
          }}
          className="text-foreground/65 mx-auto mt-6 max-w-xl text-2xl leading-12 tracking-tight md:text-3xl"
        >
          Transform Grok, Claude, and ChatGPT from brains into governed,
          auditable digital workers wired into your phones, EHRs, CRMs, billing
          systems, and mission-critical SaaS.
        </motion.p>
      </div>

      {/* Carousel */}
      <div
        className="relative -mx-6 mt-2 h-100 w-screen overflow-hidden sm:h-125 md:h-137.5 lg:h-150 xl:h-175"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
        }}
      >
        <div className="absolute left-1/2 top-25 -translate-x-1/2 sm:top-30 lg:top-35 xl:top-40">
          <div className="origin-top scale-[0.6] lg:scale-[0.7] xl:scale-100">
            <RotatingCards
              cards={carouselCards}
              radius={1000}
              cardClassName="rounded-md"
              cardWidth={350}
              cardHeight={275}
              duration={100}
              pauseOnHover={true}
              autoPlay={true}
              initialRotation={-90}
              showTrackLine={true}
              trackLineOffset={25}
            />
          </div>
        </div>
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center px-6 pb-24 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: easeOut }}
      >
        <h2 className="max-w-3xl text-3xl font-medium tracking-tight md:text-5xl lg:text-6xl">
          The Brains
          <br />
          Need Wiring
        </h2>
        <motion.a
          href="/contact"
          className="bg-accent group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-md py-3 pl-5 pr-3 font-medium text-black shadow-lg shadow-accent/25 transition-all duration-500 ease-out hover:rounded-[50px] hover:shadow-xl hover:shadow-accent/40 sm:w-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.2 }}
        >
          <span>Talk to the operators</span>
          <span className="bg-background text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110">
            <HiMiniArrowLongRight className="h-5 w-5" />
          </span>
        </motion.a>
      </motion.div>
    </section>
  );
}
