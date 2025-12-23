"use client";

import { enterpriseAIPillarData } from "@/data/enterpriseAIPillars";
import EnterpriseAIPillarCard from "./EnterpriseAIPillarCard";
import { motion, useReducedMotion } from "motion/react";

const EnterpriseAIPillarCardContainer = () => {
  const reducedMotion = useReducedMotion();

  return (
    <div id="enterprise-pillars-cards">
      <div className="grid gap-6 md:grid-cols-2">
        {enterpriseAIPillarData.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={
              reducedMotion
                ? false
                : { opacity: 0, y: 16, filter: "blur(2px)" }
            }
            whileInView={
              reducedMotion
                ? undefined
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.55,
              ease: "easeOut",
              delay: idx * 0.1,
            }}
          >
            <EnterpriseAIPillarCard active={false} {...card} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EnterpriseAIPillarCardContainer;

