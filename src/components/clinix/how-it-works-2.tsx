"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const cards = [
  {
    number: 1,
    title: "Capture Clinical Documentation",
    link: "AI documentation layer",
    items: [
      "AI-assisted clinical notes",
      "Structured encounter data",
      "Provider workflow support",
    ],
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
  },
];

export function HowItWorks2() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section
      id="how-it-works"
      className="w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#0b0b0c]"
      aria-label="How it works"
    >
      <div className="max-w-[1400px] mx-auto w-full">
        {/* Header: headline starts dimmer and becomes fully opaque as the subheadline (new line) appears */}
        <motion.header
          className="text-center mb-12 sm:mb-14 lg:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.05,
              },
            },
          }}
        >
          <motion.h2
            variants={{
              hidden: { opacity: 0.45, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white"
          >
            How Clinix Works
          </motion.h2>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="mt-4 sm:mt-5 text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            From documentation through billing to revenue cycle—one platform that helps practices capture more and waste less.
          </motion.p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-12 sm:mb-14 lg:mb-16">
          {cards.map((card, idx) => (
            <motion.article
              key={card.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative overflow-hidden rounded-2xl bg-neutral-900 min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] flex flex-col cursor-pointer border border-white/10 hover:border-white/20 transition-colors duration-300"
              onMouseEnter={() => setHoveredCard(card.number)}
              onMouseLeave={() => setHoveredCard(null)}
              aria-label={`Step ${card.number}: ${card.title}`}
            >
              <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${card.image})` }}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{
                  opacity: hoveredCard === card.number ? 1 : 0,
                  scale: hoveredCard === card.number ? 1 : 1.08,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 bg-black/65"
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredCard === card.number ? 1 : 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />

              <div className="relative z-10 flex flex-col h-full pt-6 sm:pt-8 px-6 sm:px-8">
                <div className="flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-4 transition-colors duration-300 ${
                      hoveredCard === card.number
                        ? "bg-white text-neutral-900"
                        : "bg-white/15 text-white"
                    }`}
                  >
                    {card.number}
                  </div>

                  <h3
                    className={`text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight leading-tight mb-2 transition-colors duration-300 ${
                      hoveredCard === card.number ? "text-white" : "text-white"
                    }`}
                  >
                    {card.title}
                  </h3>

                  <a
                    href="#"
                    className={`inline-flex items-center gap-2 text-sm font-medium transition-colors duration-300 group ${
                      hoveredCard === card.number
                        ? "text-white/95 hover:text-white"
                        : "text-white/60 hover:text-white/90"
                    }`}
                  >
                    {card.link}
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </a>
                </div>

                <div className="mt-auto -mx-6 sm:-mx-8">
                  {card.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className={`py-3 px-6 border-t transition-colors duration-300 ${
                        hoveredCard === card.number
                          ? "border-white/25 text-white/90"
                          : "border-white/10 text-white/70"
                      }`}
                    >
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 group"
          >
            <span className="text-sm sm:text-base">
              See how Clinix can support your practice. Get in touch for a tailored walkthrough.
            </span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
