"use client";

import Link from "next/link";
import { motion } from "motion/react";

export default function ClinixCTA() {
  return (
    <section className="relative px-6 sm:px-8 lg:px-16 py-20 lg:py-28 bg-[#0b0b0c]">
      <div
        className="max-w-3xl mx-auto text-center relative rounded-3xl p-12 lg:p-16"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <motion.h2
          className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          See where your practice is losing time and revenue.
        </motion.h2>
        <motion.p
          className="text-lg text-white/80 mb-10 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          Explore how Clinix AI improves documentation, billing, and revenue
          cycle performance.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="#"
            className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 rounded-full bg-white text-[#0b0b0c] font-medium text-base hover:bg-white/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0c]"
          >
            Request Demo
          </Link>
          <Link
            href="#"
            className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 rounded-full border border-white/30 text-white font-medium text-base hover:bg-white/5 hover:border-white/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0c]"
          >
            Contact Sales
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
