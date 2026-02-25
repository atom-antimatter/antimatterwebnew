"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { HiScale, HiLightBulb, HiMicrophone } from "react-icons/hi2";

const easeOut = [0.16, 1, 0.3, 1] as const;

const atomProducts = [
  {
    icon: HiScale,
    title: "Atom Competitive Matrix",
    description:
      "Compare Atom against enterprise AI vendors across deployment, security, IP ownership, and capabilities.",
    href: "/resources/vendor-matrix",
    cta: "Compare vendors",
  },
  {
    icon: HiLightBulb,
    title: "Atom IntentIQ",
    description:
      "Score buyer intent in real-time, qualify leads, and generate follow-up emails and proposals with AI.",
    href: "/atom-intentiq",
    cta: "Try IntentIQ",
  },
  {
    icon: HiMicrophone,
    title: "Atom Voice",
    description:
      "Deploy empathic AI voice agents for real-time phone conversations, intake, and support workflows.",
    href: "/voice-agents",
    cta: "Try Voice",
  },
];

export function Stats(): ReactNode {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.5 });

  return (
    <section className="bg-background px-6 py-16 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          ref={headerRef}
          className="mb-12 text-center md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl">
            How to Use Atom
          </h2>
          <p className="text-foreground/50 mt-4 max-w-2xl mx-auto text-lg">
            Explore the tools that power enterprise AI deployment
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {atomProducts.map((product, index) => {
            const Icon = product.icon;
            return (
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: easeOut,
                }}
              >
                <Link
                  href={product.href}
                  className="group block h-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-8 hover:border-foreground/20 hover:bg-foreground/[0.06] transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-foreground/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-foreground/70" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{product.title}</h3>
                  <p className="text-foreground/50 text-sm leading-relaxed mb-6">
                    {product.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-white group-hover:gap-3 transition-all duration-300">
                    {product.cta}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
