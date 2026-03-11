"use client";

import { motion } from "motion/react";

const WORKFLOW_STEPS = [
  {
    title: "Patient Visit",
    description: "Encounter begins; Clinix is ready to capture and support.",
  },
  {
    title: "Documentation Capture",
    description: "AI-assisted notes and scribing reduce charting time.",
  },
  {
    title: "Coding & Billing Preparation",
    description: "Documentation is reviewed for accurate codes and claim readiness.",
  },
  {
    title: "Claim Processing",
    description: "Claims move through submission with fewer errors.",
  },
  {
    title: "RCM Optimization",
    description: "Revenue cycle intelligence surfaces issues and opportunities.",
  },
  {
    title: "Practice Insights",
    description: "Operational and financial visibility inform decisions.",
  },
];

function ArrowDown() {
  return (
    <svg
      className="w-5 h-5 text-white/30 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      className="w-6 h-6 text-white/30 flex-shrink-0 hidden lg:block"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 8l4 4m0 0l-4 4m4-4H3"
      />
    </svg>
  );
}

export default function ClinixWorkflow() {
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
          How Clinix fits into the practice workflow
        </motion.h2>

        {/* Mobile: vertical stack with down arrows */}
        <div className="flex flex-col lg:hidden gap-0">
          {WORKFLOW_STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="w-full max-w-sm mx-auto p-5 rounded-xl border border-white/10 bg-white/[0.02] text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-white/70">{step.description}</p>
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className="py-2">
                  <ArrowDown />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Desktop: horizontal flow with right arrows */}
        <div className="hidden lg:flex flex-wrap items-stretch justify-center gap-4 xl:gap-6">
          {WORKFLOW_STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              className="flex items-center gap-4 xl:gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: index * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="w-44 xl:w-52 p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors min-h-[120px] flex flex-col justify-center">
                <h3 className="text-base font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-white/70 leading-snug">
                  {step.description}
                </p>
              </div>
              {index < WORKFLOW_STEPS.length - 1 && <ArrowRight />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
