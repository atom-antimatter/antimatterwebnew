"use client";
import Reveal from "@/components/ui/Reveal";
import TitleH1Anim from "@/components/ui/TitleH1Anim";
import TransitionContainer from "@/components/ui/TransitionContainer";
import TransitionLink from "@/components/ui/TransitionLink";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WorkCardProps {
  id: number;
  image: string;
  tags: string[];
  title: string;
  link: string;
}

const WorkComponent = ({ WorkData }: { WorkData: WorkCardProps[] }) => {
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
      <TransitionContainer>
        <div className="border-b border-foreground/30 pb-3">
          <TitleH1Anim className="text-5xl md:text-6xl lg:text-7xl xl:text-9xl font-semibold">
            WORK
          </TitleH1Anim>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-5 gap-y-20 mt-10">
          {WorkData.map(({ id, image, tags, title, link }) => (
            <Reveal
              delay={id % 2 === 0 ? 0.3 : 0}
              className={`${
                id === 1
                  ? "col-span-1 md:col-span-6 lg:col-span-7 xl:col-span-7"
                  : id === 2
                  ? "col-span-1 md:col-span-6 lg:col-span-5 xl:col-span-5"
                  : "col-span-1 md:col-span-6"
              } relative group`}
              initialAnim={id < 3}
              key={id}
            >
              <TransitionLink href={link}>
                <p>{id >= 10 ? id : `0${id}`}</p>
                <Image
                  src={image}
                  alt={title}
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={(e) => handleMouseEnter(link, e)}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleClick}
                />
                <div className="flex justify-between mt-3">
                  <h3 className="text-xl lg:text-2xl xl:text-3xl">{title}</h3>
                  <div className="flex gap-2">
                    {tags.map((tag) => (
                      <div
                        key={tag}
                        className="border py-[1px] xl:py-0.5 px-1 xl:px-2 border-foreground/20 rounded-full text-sm leading-7"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </TransitionLink>
            </Reveal>
          ))}
        </div>
      </TransitionContainer>
    </>
  );
};

export default WorkComponent;
