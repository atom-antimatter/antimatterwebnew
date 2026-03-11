"use client";

import { motion } from "motion/react";

const ARCHITECTURE_CARDS = [
  {
    title: "AI Documentation Layer",
    description:
      "AI-assisted clinical documentation and scribing that helps providers produce cleaner notes with less time spent charting.",
  },
  {
    title: "Coding & Claim Preparation",
    description:
      "Automated review of documentation to support more accurate coding and claim readiness.",
  },
  {
    title: "Revenue Cycle Intelligence",
    description:
      "Systems that help practices detect billing issues, identify revenue leakage, and reduce denial rates.",
  },
  {
    title: "Billing Workflow Automation",
    description:
      "Tools that support billing teams with automation, prioritization, and workflow visibility across claims and follow-up tasks.",
  },
  {
    title: "Practice Operations Layer",
    description:
      "Operational intelligence that surfaces patient outreach needs, workflow bottlenecks, and performance insights.",
  },
];

export default function ClinixArchitecture() {
  return (
    <section
      id="architecture"
      className="relative px-6 sm:px-8 lg:px-16 py-20 lg:py-28 bg-[#0b0b0c]"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Inside the Clinix AI Platform
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {ARCHITECTURE_CARDS.map((card, index) => (
            <motion.article
              key={card.title}
              className="group relative p-6 lg:p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-colors duration-300"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ scale: 1.02 }}
            >
              <span
                className="absolute top-5 left-5 text-sm font-medium text-white/40 tabular-nums"
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3 pr-8">
                {card.title}
              </h3>
              <p className="text-white/70 text-base leading-relaxed">
                {card.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
