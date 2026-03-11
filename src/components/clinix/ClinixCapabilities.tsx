"use client";

import { motion } from "motion/react";

const CAPABILITY_CARDS = [
  {
    title: "AI Scribing",
    description:
      "Reduce documentation burden for providers while capturing structured clinical data.",
  },
  {
    title: "Billing Support",
    description:
      "Help billing teams move charges, claims, and follow-up forward faster.",
  },
  {
    title: "Revenue Cycle Management",
    description:
      "Gain visibility into the financial lifecycle of patient encounters.",
  },
  {
    title: "Denial Prevention",
    description:
      "Surface issues that commonly lead to rejected or delayed claims.",
  },
  {
    title: "Documentation Quality",
    description:
      "Improve the clarity and completeness of clinical notes.",
  },
  {
    title: "Patient Follow-Up",
    description:
      "Automate communication and operational tasks after visits.",
  },
];

export default function ClinixCapabilities() {
  return (
    <section className="relative px-6 sm:px-8 lg:px-16 py-20 lg:py-28 bg-[#0b0b0c]">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Capabilities for modern practices
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CAPABILITY_CARDS.map((card, index) => (
            <motion.article
              key={card.title}
              className="group relative p-6 lg:p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-colors duration-300"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.5,
                delay: index * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold text-white mb-3">
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
