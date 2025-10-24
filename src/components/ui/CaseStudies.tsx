"use client";
import { useState, useCallback } from "react";
import WorkBox, { WorkListProps } from "./WorkBox";
import Image from "next/image";
import Reveal from "./Reveal";
import { motion } from "motion/react";

const CaseStudies = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // memoize the hover handler to avoid rerenders
  const handleMouseOver = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
      <Reveal className="flex col-span-1 lg:col-span-7 flex-col">
        {WorkList.map((work, index) => (
          <WorkBox
            key={work.number}
            {...(work as WorkListProps)}
            active={activeIndex === index}
            onMouseOver={() => handleMouseOver(index)}
          />
        ))}
      </Reveal>

      <Reveal
        delay={0.2}
        className="col-span-5 h-full items-center hidden lg:flex justify-center relative"
      >
        <div className="absolute right-0 top-1/2 overflow-hidden -translate-y-1/2 w-full aspect-square">
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: `-${activeIndex * 100}%` }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smooth motion
            }}
            style={{
              willChange: "transform",
              transform: `translate3d(0, -${activeIndex * 100}%, 0)`,
            }}
            className="size-full flex flex-col"
          >
            {WorkList.map((work, i) => (
              <Image
                key={work.title}
                src={`/images/CaseStudies/${work.media?.url}`}
                alt={work.title}
                className="w-full object-cover aspect-square"
                width={1000}
                height={1000}
                loading={i === 0 ? "eager" : "lazy"}
                priority={i === 0}
              />
            ))}
          </motion.div>
        </div>
      </Reveal>
    </div>
  );
};

export default CaseStudies;

interface CaseStudiesProps extends WorkListProps {
  media: { url: string; type: "image" | "video" };
}

const WorkList: CaseStudiesProps[] = [
  {
    number: "01",
    title: "Clinix AI",
    workType: "Web Design, App Design, AI Development, GTM",
    link: "/case-study/clinixAI",
    media: { url: "clinix/clinixai.jpg", type: "image" },
  },
  {
    number: "02",
    title: "Synergies4",
    workType: "App Design, AI Development",
    link: "/case-study/synergies4",
    media: { url: "synergies4.jpg", type: "image" },
  },
  {
    number: "03",
    title: "Curehire",
    workType: "Web Design, Development",
    link: "/case-study/curehire",
    media: { url: "curehire.jpg", type: "image" },
  },
  {
    number: "04",
    title: "OWASP Foundation",
    workType: "Web Design, Development",
    link: "/case-study/owasp",
    media: { url: "owasp.jpg", type: "image" },
  },
  {
    number: "05",
    title: "Feature",
    workType: "App Design, GTM",
    link: "/case-study/feature",
    media: { url: "feature.jpg", type: "image" },
  },
];
