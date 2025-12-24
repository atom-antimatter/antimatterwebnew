"use client";
import { useLoading, usePageTransition } from "@/store";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { KeyRound, Server, Shuffle } from "lucide-react";
import Button from "./ui/Button";
import TransitionLink from "./ui/TransitionLink";
import ParticelsStatic from "./ParticelsStatic";

const AtomAIHeroComponent = () => {
  const finished = useLoading((s) => s.finished);

  const VALUE_PROPS = [
    {
      key: "deploy",
      title: "Deploy Anywhere",
      Icon: Server,
    },
    {
      key: "controls",
      title: "RBAC + Audit Trails",
      Icon: KeyRound,
    },
    {
      key: "flex",
      title: "Provider Flexibility",
      Icon: Shuffle,
    },
  ] as const;

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const setIsTransition = usePageTransition((s) => s.setIsTransition);
  useEffect(() => {
    setIsTransition(false);
  }, [setIsTransition]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(Boolean(mq?.matches));
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setIsLowEndDevice(Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4));
  }, []);

  if (!finished) return null;
  return (
    <AnimatePresence>
      <>
        {/* Mobile hero: intentional vertical stack (no overlap with orb/value props) */}
        {isMobile ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full flex flex-col items-center text-center px-5 pt-[calc(env(safe-area-inset-top)+56px)] pb-8"
          >
            <div className="w-full max-w-[420px] mx-auto flex flex-col items-center gap-4">
              <h1 className="text-[34px] leading-[1.12] font-light tracking-normal">
                <span className="block">
                  Building <span className="italic font-bold">Enterprise AI</span>
                </span>
                <span className="block">
                  <span className="italic font-bold">Systems</span> That Matter
                </span>
              </h1>

              <p className="text-sm text-foreground/80 max-w-[40ch] leading-relaxed">
                Atom AI is a framework for teams deploying voice, search, and workflow agents in controlled environments. Run it in your VPC, on‑prem, or at the edge—with governance and zero‑training guarantees.
              </p>

              <div className="pt-1 w-full">
                <TransitionLink href="/contact" className="w-full sm:w-auto">
                  <Button>
                    <span className="px-10 py-3 block min-h-[48px] w-full">
                      Talk to Our Team
                    </span>
                  </Button>
                </TransitionLink>
              </div>

              {/* Value props: stacked cards on mobile (kept below headline + CTA) */}
              <div className="w-full pt-6 border-t border-foreground/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {VALUE_PROPS.map(({ key, title, Icon }) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-foreground/10 bg-background/20 backdrop-blur px-4 py-3 transition-colors hover:bg-background/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 rounded-xl border border-foreground/10 bg-white/5 flex items-center justify-center">
                          <Icon
                            className="size-5 text-tertiary/90"
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-semibold leading-tight text-foreground">
                            {title}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3D orb moved below CTA + value props on mobile; lite fallback for low-end/reduced-motion */}
              <div className="w-full flex justify-center pt-5 pb-2">
                <ParticelsStatic
                  id="particles3d-static-mobile"
                  inline
                  lite={prefersReducedMotion || isLowEndDevice}
                  className="size-[220px] mobile:size-[240px]"
                />
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* Desktop/tablet hero: keep existing layout */}
        {!isMobile ? (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full md:w-auto max-w-[860px]">
                  {VALUE_PROPS.map(({ key, title, Icon }) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-foreground/10 bg-background/20 backdrop-blur px-4 py-3 transition-colors hover:bg-background/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 rounded-xl border border-foreground/10 bg-white/5 flex items-center justify-center">
                          <Icon
                            className="size-5 text-tertiary/90"
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-semibold leading-tight text-foreground">
                            {title}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        ) : null}
      </>
    </AnimatePresence>
  );
};

export default AtomAIHeroComponent;

