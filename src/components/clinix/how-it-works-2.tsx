"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const CARDS = [
  {
    number: 1,
    title: "Capture Clinical Documentation",
    link: "AI documentation layer",
    items: [
      "AI-assisted clinical notes",
      "Structured encounter data",
      "Provider workflow support",
    ],
    image: "/images/clinix/doc-layer.jpg",
  },
  {
    number: 2,
    title: "Prepare Billing Upstream",
    link: "Coding & claim readiness",
    items: [
      "Coding support",
      "Claim preparation",
      "Submission quality checks",
      "Denial prevention",
    ],
    image: "/images/clinix/billing-layer.jpg",
  },
  {
    number: 3,
    title: "Optimize Revenue Cycle",
    link: "RCM intelligence",
    items: [
      "Denial pattern detection",
      "Revenue leakage insights",
      "Billing workflow automation",
      "Operational analytics",
    ],
    image: "/images/clinix/rcm-layer.jpg",
  },
] as const;

export function HowItWorks2() {
  return (
    <section
      id="how-it-works"
      className="relative bg-[#0b0b0c] py-32 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <motion.header
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
            How Clinix Works
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Clinix connects documentation, billing preparation, and revenue cycle intelligence into a unified operational platform for modern practices.
          </p>
        </motion.header>

        {/* Desktop: 1 large card left, 2 stacked cards right. Mobile: stack all */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-6 lg:gap-8">
          {/* Card 1 — large, with image background */}
          <motion.article
            className="relative rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-white/20 hover:bg-white/[0.04] transition-colors duration-300 lg:row-span-2 lg:min-h-0 flex flex-col"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
          >
            <div className="relative h-48 sm:h-56 lg:h-64 xl:h-72 bg-[#141416]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CARDS[0].image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c] via-[#0b0b0c]/60 to-transparent" />
            </div>
            <div className="relative p-6 lg:p-8 flex flex-col flex-1">
              <span
                className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-white/10 text-white text-sm font-semibold tabular-nums mb-4"
                aria-hidden
              >
                {CARDS[0].number}
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                {CARDS[0].title}
              </h3>
              <a
                href="#architecture"
                className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors"
              >
                {CARDS[0].link}
                <ArrowRight className="w-4 h-4" />
              </a>
              <ul className="space-y-2 text-white/60 text-sm">
                {CARDS[0].items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </motion.article>

          {/* Cards 2 and 3 — stacked on the right */}
          {CARDS.slice(1).map((card, index) => (
            <motion.article
              key={card.number}
              className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 lg:p-8 overflow-hidden hover:border-white/20 hover:bg-white/[0.04] transition-colors duration-300"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: (index + 1) * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -4 }}
            >
              <span
                className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-white/10 text-white text-sm font-semibold tabular-nums mb-4"
                aria-hidden
              >
                {card.number}
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                {card.title}
              </h3>
              <a
                href="#architecture"
                className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors"
              >
                {card.link}
                <ArrowRight className="w-4 h-4" />
              </a>
              <ul className="space-y-2 text-white/60 text-sm">
                {card.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
