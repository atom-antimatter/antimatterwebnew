import React from "react";
import CaseStudies from "./ui/CaseStudies";
import BreakTitle from "./ui/BreakTitle";
import Reveal from "./ui/Reveal";

const WorkSection = () => {
  return (
    <div className="relative" id="work-section">
      <div className="flex flex-col gap-24 ">
        <div className="flex flex-col md:flex-row justify-between gap-5">
          <BreakTitle text="Case Studies" />

          <Reveal>
            <p className="text-left md:text-right font-light">
              Proven results, measurable impact—explore <br /> the
              transformations we&apos;ve delivered.
            </p>
          </Reveal>
        </div>
        <CaseStudies />
      </div>
    </div>
  );
};

export default WorkSection;
