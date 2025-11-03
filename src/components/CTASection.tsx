import React from "react";
import Button from "./ui/Button";
import DarkVeil from "./ui/bits/DarkVeilBG";
import SplitTextWavy from "./ui/SplitTextWavy";
import TransitionLink from "./ui/TransitionLink";
import { GoArrowRight } from "react-icons/go";

const CTASection = () => {
  return (
    <div className="p-5 sm:p-20 md:p-30 pt-28 sm:pt-44 border border-foreground/15 rounded-2xl relative overflow-hidden">
      <div className="relative z-10 pb-10 sm:pb-0">
        <h2 className="text-2xl sm:text-4xl mb-10">
          We turn bold ideas into <br />
          <SplitTextWavy
            text="powerful digital realities."
            amplitude={10}
            duration={2.4}
            stagger={0.06}
            className="font-semibold"
            letterSpacingClass="tracking-normal"
          />
        </h2>
        <TransitionLink href="/contact">
          <Button>
            <span className="sm:text-xl flex items-center gap-5">
              Let&apos;s work together{" "}
              <GoArrowRight className="size-6 sm:size-8" />
            </span>
          </Button>
        </TransitionLink>
      </div>
      <div className="absolute w-full h-full top-0 left-0 saturate-50">
        <DarkVeil hueShift={360} />
      </div>
    </div>
  );
};

export default CTASection;
