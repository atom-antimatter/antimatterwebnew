"use client";

import { motion, AnimatePresence, Variants } from "motion/react";
import { usePathname } from "next/navigation";
import { translate, translate2 } from "./anim";

const anim = (variants: Variants) => {
  return {
    variants,
    initial: "initial",
    animate: "enter",
    exit: "exit",
  };
};

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  // The `key` is tied to the url using the `usePathname` hook.
  const key = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={key}>
        {children}
        <motion.div
          {...anim(translate)}
          className="fixed w-screen h-screen bg-accent z-50 inset-0 overflow-hidden"
        >
          <motion.div
            {...anim(translate2)}
            className="w-full h-full bg-background "
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
