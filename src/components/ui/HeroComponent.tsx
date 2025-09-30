"use client";
import { animate, AnimatePresence, motion } from "motion/react";
import Button from "./Button";
import { useStartProjectModal } from "@/store";
import { useLoading } from "@/store";
import Counter from "./bits/Counter";
import { useEffect, useState } from "react";

const HeroComponent = () => {
  const { setOpen } = useStartProjectModal();
  const finished = useLoading((s) => s.finished);
  const [projects, setProjects] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);

  const [fontSize, setFontSize] = useState(() => {
    if (typeof window === "undefined") return 30;
    if (window.innerWidth >= 1024) return 30;
    return 22;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setFontSize(30);
      else setFontSize(22);
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
          className="flex flex-col w-main m-auto  pt-10 pb-14 h-full relative z-10"
        >
          <div className="grow flex justify-center items-center ">
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
          >
            <div
              className="flex flex-col md:flex-row justify-between w-full gap-10 md:gap-0 items-center md:items-end"
              id="hero-stats"
            >
              <div className="flex max-w-xs lg:max-w-lg flex-col gap-10 md:items-start items-center text-center md:text-left">
                <p>
                  We empower organizations with AI that turns complex challenges
                  into real-world outcomes.
                </p>
                <div className="flex text-lg">
                  <Button onClick={() => setOpen(true)}>
                    Start Your Project
                  </Button>
                </div>
              </div>
              <div className="flex text-sm mobile:gap-10 lg:gap-16 sm:justify-center md:justify-end justify-between w-full">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h3 className="text-2xl lg:text-3xl flex items-center font-semibold text-nowrap -ml-5 sm:-ml-0">
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
                  <h3>
                    Projects <br /> Delivered
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h3 className="text-2xl lg:text-3xl flex items-center font-semibold text-nowrap -ml-5 sm:-ml-0">
                    <Counter
                      value={satisfaction}
                      gap={2}
                      fontSize={fontSize}
                      fontWeight={600}
                      gradientFrom="transparent"
                    />
                    <span className="text-tertiary">%</span>
                  </h3>
                  <h3>
                    Client
                    <br />
                    Satisfaction
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h3 className="text-2xl lg:text-3xl font-semibold text-nowrap">
                    24<span className="text-tertiary">/</span>7
                  </h3>
                  <h3>
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
