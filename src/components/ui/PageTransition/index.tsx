"use client";

import { usePageTransition } from "@/store";
import { motion } from "motion/react";

const PageTransition = () => {
  const isTransition = usePageTransition((s) => s.isTransition);
  return (
    <motion.div>
      <motion.div
        initial={{ y: "0" }}
        animate={{
          y: isTransition ? "0" : "-100%",
          transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] },
          transitionEnd: {
            y: isTransition ? "0" : "100%",
          },
        }}
        className="fixed w-screen h-screen bg-accent z-50 inset-0 overflow-hidden"
      >
        <motion.div
          initial={{ y: "0" }}
          animate={{
            y: isTransition ? "0" : "500px",
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
          className="w-full h-full bg-background"
        />
      </motion.div>
    </motion.div>
  );
};

export default PageTransition;
