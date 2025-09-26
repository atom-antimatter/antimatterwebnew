"use client";
import { motion } from "motion/react";
import Image from "next/image";

const LightRays = () => {
  return (
    <motion.div
      className="absolute inset-x-0 top-0 h-[120vh] overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <Image
        src={"/images/LightRays.png"}
        alt="Light rays AntimatterAI"
        width={880}
        height={975}
        loading="eager"
        className="h-auto"
      />
    </motion.div>
  );
};

export default LightRays;
