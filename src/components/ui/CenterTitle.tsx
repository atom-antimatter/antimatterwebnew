"use client";

import React, { PropsWithChildren } from "react";
import { motion } from "motion/react";

type Props = PropsWithChildren & {
  className?: string;
};

const CenterTitle = ({ children, className, ...props }: Props) => {
  return (
    <div className="relative text-3xl sm:text-title overflow-visible">
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-radial from-transparent 
          to-background w-full h-[calc(100%+30px)] from-10%  to-90%"
      ></div>
      <motion.h2 
        className={`relative ${className || ""}`}
        initial={{ 
          textShadow: "0px 0px 0px rgba(0, 0, 0, 0)" 
        }}
        whileInView={{ 
          textShadow: [
            "0px 0px 0px rgba(0, 0, 0, 0)",
            "0px 2px 4px rgba(0, 0, 0, 0.1)",
            "0px 4px 8px rgba(0, 0, 0, 0.2)",
            "0px 6px 12px rgba(0, 0, 0, 0.3)",
            "0px 8px 20px rgba(0, 0, 0, 0.4)"
          ]
        }}
        transition={{ 
          duration: 1.5, 
          ease: "easeOut",
          times: [0, 0.25, 0.5, 0.75, 1]
        }}
        viewport={{ once: true }}
        {...props}
      >
        {children}
      </motion.h2>
    </div>
  );
};

export default CenterTitle;
