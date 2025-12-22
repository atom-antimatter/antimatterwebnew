"use client";
import { useLoading, usePageTransition } from "@/store";
import { animate, AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import Counter from "./bits/Counter";
import Button from "./Button";
import TransitionLink from "./TransitionLink";

const HeroComponent = () => {
  const finished = useLoading((s) => s.finished);
  const [projects, setProjects] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);

  const [fontSize, setFontSize] = useState(() => {
    if (typeof window === "undefined") return 30;
    if (window.innerWidth >= 640) return 22;
    return 18;
  });
  const setIsTransition = usePageTransition((s) => s.setIsTransition);
  useEffect(() => {
    setIsTransition(false);
  }, [setIsTransition]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setFontSize(30);
      else if (window.innerWidth >= 640) setFontSize(22);
      else setFontSize(18);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (finished) {
      const projANim = animate(0, 50, {
        duration: 2,
        ease: "circOut",
        onUpdate: (latest) => setProjects(Math.floor(latest)),
      });
      const satAnim = animate(0, 100, {
        duration: 2,
        ease: "circOut",
        onUpdate: (latest) => setSatisfaction(Math.floor(latest)),
      });
      return () => {
        projANim.stop();
        satAnim.stop();
      };
    }
  }, [finished]);
  if (!finished) return null;
  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col w-main m-auto pt-10 pb-14 h-full relative z-10 justify-between"
        >
          <div className="flex justify-center items-center flex-1 min-h-0">
            <h1
              className="text-3xl/[1.7rem] sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl font-light sm-text-left text-center 
              sm:w-[500px] md:w-[660px] xl:w-[830px] 2xl:w-[1000px]
              "
              id="hero-title"
            >
              <motion.div
                id="title1"
                initial={{ x: 150 }}
                animate={{ x: 0 }}
                transition={{ duration: 2, ease: "anticipate" }}
                className="flex justify-center sm:justify-start"
              >
                Building <span className="italic font-bold pr-2">Digital</span>
              </motion.div>
              <motion.div
                className="text-right mt-0 flex justify-center sm:justify-end"
                id="title2"
                initial={{ x: -150 }}
                animate={{ x: 0 }}
                transition={{ duration: 2, ease: "anticipate" }}
              >
                <span className="italic font-bold">Solutions</span> That Matter
              </motion.div>
            </h1>
          </div>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.8, ease: "anticipate" }}
            className="flex-shrink-0"
          >
            <div
              className="flex flex-col md:flex-row justify-between w-full gap-6 md:gap-0 items-center md:items-end"
              id="hero-stats"
            >
              <div className="flex max-w-xs lg:max-w-lg flex-col gap-6 md:gap-10 md:items-start items-center text-center md:text-left">
                <p className="text-sm md:text-base">
                  We empower organizations with AI that turns complex challenges
                  into real-world outcomes.
                </p>
                <div className="flex text-lg">
                  <TransitionLink href="/contact">
                    <Button>
                      Start Your Project
                    </Button>
                  </TransitionLink>
                </div>
              </div>
              <div className="flex text-xs md:text-sm gap-6 mobile:gap-8 lg:gap-16 sm:justify-center md:justify-end justify-between w-full md:w-auto">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl flex items-center font-semibold text-nowrap -ml-5 sm:-ml-0">
                    <Counter
                      value={projects}
                      places={[10, 1]}
                      gap={2}
                      fontSize={fontSize}
                      fontWeight={600}
                      gradientFrom="transparent"
                    />
                    <span className="text-tertiary">+</span>
                  </h3>
                  <h3 className="text-xs sm:text-sm leading-tight">
                    Projects <br /> Delivered
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl flex items-center font-semibold text-nowrap -ml-5 sm:-ml-0">
                    <Counter
                      value={satisfaction}
                      gap={2}
                      fontSize={fontSize}
                      fontWeight={600}
                      gradientFrom="transparent"
                    />
                    <span className="text-tertiary">%</span>
                  </h3>
                  <h3 className="text-xs sm:text-sm leading-tight">
                    Client
                    <br />
                    Satisfaction
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-nowrap">
                    24<span className="text-tertiary">/</span>7
                  </h3>
                  <h3 className="text-xs sm:text-sm leading-tight">
                    Support
                    <br />
                    Available
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </>
    </AnimatePresence>
  );
};

export default HeroComponent;
