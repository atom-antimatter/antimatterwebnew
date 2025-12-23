"use client";

import { MotionDiv } from "@/components/Motion";
import Image from "next/image";

interface DottedWorldMapProps {
  variant?: "company" | "enterpriseEdge";
  className?: string;
}

/**
 * Reusable dotted world-map component with animation variants
 * 
 * - "company" variant: Purple accent shrinks to reveal grey base (normal)
 * - "enterpriseEdge" variant: Starts all purple, settles to grey with purple accent (reversed)
 */
const DottedWorldMap = ({ variant = "company", className = "" }: DottedWorldMapProps) => {
  const isEnterpriseEdge = variant === "enterpriseEdge";
  
  // Company: clipPath shrinks from 100% to 0% (purple disappears to reveal grey)
  // EnterpriseEdge: clipPath grows from 0% to ~85% (grey appears over purple, leaving purple accent)
  const initialClipPath = isEnterpriseEdge 
    ? "circle(0% at 48% 73%)"     // Start: No grey visible (all purple)
    : "circle(100% at 48% 73%)";   // Start: Purple fully visible
  
  const finalClipPath = isEnterpriseEdge
    ? "circle(85% at 48% 73%)"     // End: Grey covers most, purple accent remains
    : "circle(0% at 48% 73%)";     // End: Purple accent only

  return (
    <div className={`relative ${className}`}>
      {/* Base layer: Grey world map (or purple for enterprise edge) */}
      <Image
        src={isEnterpriseEdge ? "/images/dotted-world-map-atlanta_accent.svg" : "/images/dotted-world-map-atlanta.svg"}
        alt="World map"
        width={639}
        height={470}
        quality={100}
        className="max-w-[500px] xl:max-w-[639px] w-full"
      />
      
      {/* Animated overlay layer */}
      <MotionDiv
        initial={{ clipPath: initialClipPath }}
        whileInView={{ clipPath: finalClipPath }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        viewport={{ once: true, amount: 0.8, margin: "30px" }}
        className="absolute top-0 left-0 w-full h-full"
      >
        <Image
          src={isEnterpriseEdge ? "/images/dotted-world-map-atlanta.svg" : "/images/dotted-world-map-atlanta_accent.svg"}
          alt="World map accent"
          width={639}
          height={470}
          quality={100}
          className="max-w-[500px] xl:max-w-[639px] w-full"
        />
      </MotionDiv>
    </div>
  );
};

export default DottedWorldMap;

