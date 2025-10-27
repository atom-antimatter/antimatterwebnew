"use client";

import { motion, MotionProps } from "motion/react";
import { PropsWithChildren, HTMLAttributes } from "react";

type MotionDivProps = PropsWithChildren<
  MotionProps & HTMLAttributes<HTMLDivElement>
>;

export const MotionDiv = ({ children, ...props }: MotionDivProps) => {
  return <motion.div {...props}>{children}</motion.div>;
};
