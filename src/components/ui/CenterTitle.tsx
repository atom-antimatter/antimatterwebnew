"use client";

import React, { PropsWithChildren } from "react";
import { motion } from "motion/react";

type Props = PropsWithChildren & React.ComponentProps<"h2">;

const CenterTitle = ({ children, ...props }: Props) => {
  return (
    <div className="relative text-3xl sm:text-title overflow-hidden">
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-radial from-transparent 
          to-background w-full h-[calc(100%+30px)] from-10%  to-90%"
      ></div>
      <h2 className="relative" {...props}>{children}</h2>
      {/* Reveal curtains - split from center */}
      <motion.div
        className="absolute top-0 left-0 h-full w-1/2 bg-background origin-left"
        initial={{ scaleX: 1 }}
        whileInView={{ scaleX: 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        viewport={{ once: true }}
      />
      <motion.div
        className="absolute top-0 right-0 h-full w-1/2 bg-background origin-right"
        initial={{ scaleX: 1 }}
        whileInView={{ scaleX: 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        viewport={{ once: true }}
      />
    </div>
  );
};

export default CenterTitle;
