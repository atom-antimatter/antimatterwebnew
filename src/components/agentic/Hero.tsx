"use client";

import { HiMiniArrowLongRight } from "react-icons/hi2";
import { motion } from "motion/react";
import { useRef, useState, useEffect, type ReactNode } from "react";
import RotatingCards, { type Card } from "./RotatingCards";

const easeOut = [0.16, 1, 0.3, 1] as const;
const headlineText = "Autonomous AI Agents for Workflows";

import Image from "next/image";

const cardData = [
  { label: "OpenAI", logo: "/img/logos/openai.svg" },
  { label: "Anthropic", logo: "/img/logos/anthropic.svg" },
  { label: "Grok", logo: "/img/logos/grok.svg" },
  { label: "Hume", logo: "/img/logos/hume.png" },
  { label: "Hugging Face", logo: "/img/logos/huggingface.svg" },
];

const carouselCards: Card[] = cardData.map((card, index) => ({
  id: index + 1,
  content: (
    <div className="flex h-full flex-col items-center justify-center p-5 bg-gradient-to-br from-white to-gray-50 border border-gray-200">
      <div className="flex-1 flex items-center justify-center w-full px-3 bg-white rounded-lg">
        <Image
          src={card.logo}
          alt={card.label}
          width={200}
          height={80}
          className={`w-auto object-contain ${
            card.label === "Anthropic" ? "h-14" : "h-10"
          }`}
        />
      </div>
      <div className="pt-2 text-center">
        <span className="text-sm font-semibold text-gray-900">{card.label}</span>
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
      <div ref={headlineRef} className="relative z-10 mx-auto md:text-center max-w-5xl">
        <h1 className="mb-8 text-5xl font-medium tracking-tighter md:text-7xl lg:text-8xl">
          {headlineText.split(" ").map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: "easeOut",
              }}
              className="inline-block mr-[0.25em]"
            >
              {word}
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
          className="text-foreground/65 mx-auto mt-6 max-w-2xl text-lg leading-relaxed tracking-tight md:text-xl"
        >
          Connect frontier AI models to your existing systems — EHRs, CRMs,
          billing, phones, and internal tools — to create governed, auditable
          AI workers that execute real workflows in production.
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
              radius={600}
              cardClassName="rounded-md"
              cardWidth={280}
              cardHeight={200}
              duration={80}
              pauseOnHover={true}
              autoPlay={true}
              initialRotation={-90}
              showTrackLine={true}
              trackLineOffset={20}
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
          className="bg-white group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-md py-3 pl-5 pr-3 font-medium text-black shadow-lg shadow-white/10 transition-all duration-500 ease-out hover:rounded-[50px] hover:shadow-xl hover:shadow-white/20 sm:w-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.2 }}
        >
          <span>Talk to the operators</span>
          <span className="bg-black text-white flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110">
            <HiMiniArrowLongRight className="h-5 w-5" />
          </span>
        </motion.a>
      </motion.div>
    </section>
  );
}
