"use client";

import { HiMiniArrowLongRight } from "react-icons/hi2";
import { motion } from "motion/react";
import type { ReactNode } from "react";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function FinalCTA(): ReactNode {
  return (
    <section className="px-6 py-24 md:py-36">
      <motion.div
        className="bg-white relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-12 text-center text-black md:rounded-4xl md:px-12 md:py-24"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: easeOut }}
      >
        <div className="relative z-10">
          <motion.h2
            className="mx-auto mb-6 max-w-2xl text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
          >
            Ready to deploy governed AI workers?
          </motion.h2>

          <motion.p
            className="mx-auto mb-10 max-w-md text-lg text-black/70"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeOut }}
          >
            Bring your preferred models. We&apos;ll bring the spine:
            orchestration, security, and execution in production.
          </motion.p>

          <motion.a
            href="/contact"
            className="group inline-flex w-full items-center justify-center gap-3 rounded-md bg-black py-3 pl-5 pr-3 font-medium text-white transition-all duration-500 ease-out hover:rounded-[50px] hover:shadow-lg sm:w-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: easeOut }}
          >
            <span>Book a call</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-all duration-300 group-hover:scale-110">
              <HiMiniArrowLongRight className="h-5 w-5" />
            </span>
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
