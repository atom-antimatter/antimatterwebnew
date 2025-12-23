"use client";
import { useLoading, usePageTransition } from "@/store";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import Button from "./ui/Button";
import TransitionLink from "./ui/TransitionLink";

const AtomAIHeroComponent = () => {
  const finished = useLoading((s) => s.finished);

  const [fontSize, setFontSize] = useState(() => {
    if (typeof window === "undefined") return 30;
    if (window.innerWidth >= 1024) return 30;
    return 22;
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 640;
  });
  const setIsTransition = usePageTransition((s) => s.setIsTransition);
  useEffect(() => {
    setIsTransition(false);
  }, [setIsTransition]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setFontSize(30);
      else setFontSize(22);
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
                Building <span className="italic font-bold pr-2">Enterprise AI</span>
              </motion.div>
              <motion.div
                className="text-right mt-0 flex justify-center sm:justify-end"
                id="title2"
                initial={{ x: -150 }}
                animate={{ x: 0 }}
                transition={{ duration: 2, ease: "anticipate" }}
              >
                <span className="italic font-bold">Systems</span> That Matter
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
                  Atom AI is a framework for teams deploying voice, search, and workflow agents in controlled environments. Run it in your VPC, on‑prem, or at the edge—with governance and zero‑training guarantees.
                </p>
                <div className="flex text-lg">
                  <TransitionLink href="/contact">
                    <Button>
                      Talk to Our Team
                    </Button>
                  </TransitionLink>
                </div>
              </div>
              <div className="flex text-xs md:text-sm gap-6 mobile:gap-8 lg:gap-16 sm:justify-center md:justify-end justify-between w-full md:w-auto">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <h3 
                    className="text-xl sm:text-2xl lg:text-3xl flex items-center font-semibold text-nowrap -ml-5 sm:-ml-0"
                    style={{ 
                      height: isMobile ? `${fontSize + 12}px` : 'auto',
                      paddingTop: isMobile ? '6px' : '0',
                      paddingBottom: isMobile ? '6px' : '0'
                    }}
                  >
                    <span className="text-tertiary">✓</span>
                  </h3>
                  <h3 className="text-xs sm:text-sm leading-tight">
                    VPC / On‑Prem
                    <br />
                    Deploy
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <h3 
                    className="text-xl sm:text-2xl lg:text-3xl flex items-center font-semibold text-nowrap -ml-5 sm:-ml-0"
                    style={{ 
                      height: isMobile ? `${fontSize + 12}px` : 'auto',
                      paddingTop: isMobile ? '6px' : '0',
                      paddingBottom: isMobile ? '6px' : '0'
                    }}
                  >
                    <span className="text-tertiary">↔</span>
                  </h3>
                  <h3 className="text-xs sm:text-sm leading-tight">
                    RBAC + Audit
                    <br />
                    Controls
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <h3 
                    className="text-xl sm:text-2xl lg:text-3xl flex items-center font-semibold text-nowrap -ml-5 sm:-ml-0"
                    style={{ 
                      height: isMobile ? `${fontSize + 12}px` : 'auto',
                      paddingTop: isMobile ? '6px' : '0',
                      paddingBottom: isMobile ? '6px' : '0'
                    }}
                  >
                    <span className="text-tertiary">⚡</span>
                  </h3>
                  <h3 className="text-xs sm:text-sm leading-tight">
                    Provider Swap
                    <br />
                    Built‑In
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

export default AtomAIHeroComponent;

