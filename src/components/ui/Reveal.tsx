"use client";

import { HTMLMotionProps, motion } from "motion/react";
import { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  viewAmount?: number;
} & HTMLMotionProps<"div">;

export default function Reveal({
  children,
  delay = 0,
  viewAmount = 0.5,
  ...props
}: RevealProps) {
  // Use lower viewAmount on mobile for faster reveals
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const effectiveViewAmount = isMobile ? 0.15 : viewAmount;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: effectiveViewAmount }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
