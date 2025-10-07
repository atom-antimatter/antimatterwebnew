"use client";

import { usePageTransition } from "@/store";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

const TransitionContainer = ({
  children,
  initial = 400,
  exit = -150,
}: {
  children: React.ReactNode;
  initial?: string | number;
  exit?: string | number;
}) => {
  const isTransition = usePageTransition((s) => s.isTransition);
  const setIsTransition = usePageTransition((s) => s.setIsTransition);
  useEffect(() => {
    setIsTransition(false);
  }, [setIsTransition]);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: initial }}
        animate={{
          y: isTransition ? exit : 0,
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
