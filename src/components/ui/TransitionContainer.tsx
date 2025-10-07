"use client";

import { usePageTransition } from "@/store";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

const TransitionContainer = ({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial?: string | number;
}) => {
  const isTransition = usePageTransition((s) => s.isTransition);
  const setIsTransition = usePageTransition((s) => s.setIsTransition);
  useEffect(() => {
    setIsTransition(false);
  }, [setIsTransition]);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: initial || 400 }}
        animate={{
          y: isTransition ? -150 : 0,
          opacity: isTransition ? 0 : 1,
          scale: isTransition ? 0.9 : 1,
        }}
        transition={{ duration: isTransition ? 0.8 : 1.6, ease: "anticipate" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default TransitionContainer;
