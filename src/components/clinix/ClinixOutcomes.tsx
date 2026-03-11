"use client";

import { motion } from "motion/react";

const OUTCOMES = [
  "Reduce documentation time for clinicians",
  "Improve billing accuracy and claim readiness",
  "Decrease preventable denials",
  "Increase revenue visibility",
  "Support staff with intelligent automation",
  "Help practices scale without adding equal administrative overhead",
];

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export default function ClinixOutcomes() {
  return (
    <section className="relative px-6 sm:px-8 lg:px-16 py-20 lg:py-28 bg-[#0b0b0c]">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Built to improve the economics of care delivery
        </motion.h2>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {OUTCOMES.map((item, index) => (
            <motion.li
              key={item}
              className="flex items-start gap-3 text-white/90 text-lg"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: index * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <CheckIcon />
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
