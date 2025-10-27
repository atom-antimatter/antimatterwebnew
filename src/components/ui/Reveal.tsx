"use client";

import { HTMLMotionProps, motion } from "motion/react";
import { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  viewAmount?: number;
  initialAnim?: boolean;
  y?: number;
} & HTMLMotionProps<"div">;

export default function Reveal({
  children,
  delay = 0,
  viewAmount = 0.5,
  y = 100,
  initialAnim,
  ...props
}: RevealProps) {
  // Use lower viewAmount on mobile for faster reveals
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
  const effectiveViewAmount = isMobile ? 0.15 : viewAmount;
  if (initialAnim)
    return (
      <motion.div
        initial={{ opacity: 0, y: y }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  return (
    <motion.div
      initial={{ opacity: 0, y: y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: effectiveViewAmount }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
