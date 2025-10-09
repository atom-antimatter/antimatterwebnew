"use client";
import { useState } from "react";
import WorkBox, { WorkListProps } from "./WorkBox";
import Reveal from "./Reveal";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

const CaseStudies = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const router = useRouter();
  const [cursor, setCursor] = useState({
    x: 0,
    y: 0,
    visible: false,
    link: "",
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursor((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
  };

  const handleMouseEnter = (link: string, e: React.MouseEvent) => {
    setCursor((prev) => ({
      ...prev,
      visible: true,
      link,
      x: e.clientX,
      y: e.clientY,
    }));
  };

  const handleMouseLeave = () => {
    setCursor((prev) => ({ ...prev, visible: false, link: "" }));
  };

  const handleClick = () => {
    if (cursor.link) {
      router.push(cursor.link);
    }
  };

  return (
    <>
      {/* Floating Circular Cursor */}
      {cursor.visible && (
        <motion.div
          className="inset-0 fixed z-20 flex mix-blend-difference items-center justify-center w-32 h-32 rounded-full bg-white text-black text-sm pointer-events-none"
          initial={{
            scale: 0,
            opacity: 0,
            x: cursor.x - 64,
            y: cursor.y - 64,
          }}
          animate={{
            x: cursor.x - 64,
            y: cursor.y - 64,
            scale: 1,
            opacity: 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 50 }}
          onClick={handleClick}
        >
          View Work
        </motion.div>
      )}
      <div className="flex flex-col w-full">
        <Reveal className="flex flex-col w-full">
          {WorkList.map((work, index) => (
            <div
              key={work.number}
              onMouseMove={handleMouseMove}
              onMouseEnter={(e) => handleMouseEnter(work.link, e)}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
            >
              <WorkBox
                {...(work as WorkListProps)}
                active={activeIndex === index}
                onMouseOver={() => setActiveIndex(index)}
              />
            </div>
          ))}
        </Reveal>
      </div>
    </>
  );
};

export default CaseStudies;

interface CaseStudiesProps extends WorkListProps {
  media: { url: string; type: "image" | "video" };
}

const WorkList: CaseStudiesProps[] = [
  {
    number: "01",
    title: "ClinixAI",
    workType: "Mobile / Web design",
    link: "/case-study/clinixAI",
    media: { url: "clinix/clinixai.jpg", type: "image" },
  },
  {
    number: "02",
    title: "Synergies4",
    workType: "App design",
    link: "/case-study/synergies4",
    media: { url: "synergies4.jpg", type: "image" },
  },
  {
    number: "03",
    title: "Curehire",
    workType: "App design",
    link: "/case-study/curehire",
    media: { url: "curehire.jpg", type: "image" },
  },
  {
    number: "04",
    title: "OWASP Foundation",
    workType: "App design",
    link: "/case-study/owasp",
    media: { url: "owasp.jpg", type: "image" },
  },
  {
    number: "05",
    title: "Feature",
    workType: "App design",
    link: "/case-study/feature",
    media: { url: "feature.jpg", type: "image" },
  },
];
