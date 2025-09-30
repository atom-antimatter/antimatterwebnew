"use client";
import React from "react";
import { motion } from "motion/react";

type Props = {
  children: React.ReactNode;
} & React.ComponentProps<"div">;

const Title = ({ children, ...props }: Props) => {
  return (
    <div className="flex relative overflow-hidden">
      <h2 className="relative text-3xl sm:text-title/tight  pr-2" {...props}>
        <span className="relative inline-block">{children}</span>
        <motion.div
          className="absolute top-0 left-0 h-full w-full pointer-events-none bg-gradient-to-l from-background from-20% to-transparent"
          initial={{ x: "-100%" }}
          whileInView={{ x: 50 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          viewport={{ once: true }}
          style={{ zIndex: 1 }}
        >
          <div className="absolute left-full -ml-1 top-0 h-full w-full bg-background" />
        </motion.div>
      </h2>
    </div>
  );
};

export default Title;
