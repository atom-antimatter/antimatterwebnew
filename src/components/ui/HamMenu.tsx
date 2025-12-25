"use client";
import { ServicesData } from "@/data/services";
import { AnimatePresence, motion, Variants } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { HiMicrophone, HiMagnifyingGlass, HiCurrencyDollar, HiChatBubbleLeftRight, HiCube } from "react-icons/hi2";
import HamButton from "./HamButton";
import NavButton from "./NavButton";
import TransitionLink from "./TransitionLink";

// Atom product type with strict literal discrimination
type AtomProductMobile = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  href: string;
  available: boolean;  // Will be true | false literal via 'as const'
};

const atomAIProducts: AtomProductMobile[] = [
  {
    icon: HiCube,
    title: "Atom Framework",
    href: "/enterprise-ai",
    available: true as const,
  },
  {
    icon: HiMicrophone,
    title: "Atom Voice",
    href: "/voice-agent-demo",
    available: true as const,
  },
  {
    icon: HiMagnifyingGlass,
    title: "Atom Search",
    href: "/atom/search",
    available: true as const,
  },
  {
    icon: HiCurrencyDollar,
    title: "Atom Finance",
    href: "/atom/finance",
    available: false as const,
  },
  {
    icon: HiChatBubbleLeftRight,
    title: "Atom Chat",
    href: "/atom/chat",
    available: false as const,
  },
];

interface NavData {
  href?: string;
  text: string;
}

interface Props {
  navData: NavData[];
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

const HamMenu = ({ navData }: Props) => {
  const [active, setActive] = useState(false);
  const [serviceNav, setServiceNav] = useState(false);
  const [atomAINav, setAtomAINav] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (!active) {
      setServiceNav(false);
      setAtomAINav(false);
    }
  }, [active]);
  useEffect(() => {
    setActive(false);
  }, [pathname]);
  // Lock page scroll when the mobile menu is open (mobile-only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!isMobile) return;
    const html = document.documentElement;
    const body = document.body;
    let scrollY = 0;
    if (active) {
      scrollY = window.scrollY || window.pageYOffset;
      body.dataset.prevScrollY = String(scrollY);
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      html.style.height = "100%";
      body.style.height = "100%";
      (html.style as any).overscrollBehavior = "none";
      (body.style as any).overscrollBehavior = "none";
      body.style.position = "fixed";
      body.style.width = "100%";
      body.style.top = `-${scrollY}px`;
    } else {
      const prev = Number(body.dataset.prevScrollY || 0);
      html.style.overflow = "";
      body.style.overflow = "";
      html.style.height = "";
      body.style.height = "";
      (html.style as any).overscrollBehavior = "";
      (body.style as any).overscrollBehavior = "";
      body.style.position = "";
      body.style.width = "";
      body.style.top = "";
      window.scrollTo(0, prev);
    }
    return () => {
      const prev = Number(body.dataset.prevScrollY || 0);
      html.style.overflow = "";
      body.style.overflow = "";
      html.style.height = "";
      body.style.height = "";
      (html.style as any).overscrollBehavior = "";
      (body.style as any).overscrollBehavior = "";
      body.style.position = "";
      body.style.width = "";
      body.style.top = "";
      if (active) window.scrollTo(0, prev);
    };
  }, [active]);
  return (
    <>
      <HamButton active={active} onClick={() => setActive(!active)} />
      <AnimatePresence>
        {active && (
          <div className="fixed z-50 inset-0 h-dvh w-screen md:hidden flex justify-end overflow-hidden touch-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/70 absolute inset-0"
              onClick={() => setActive(!active)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full max-w-[320px] w-full bg-zinc-950 p-5 sm:px-8 relative z-10 overflow-x-hidden overflow-y-auto touch-none"
            >
              <div className="relative flex items-center h-full">
                <div className="absolute top-0 right-0">
                  <HamButton
                    active={active}
                    onClick={() => setActive(!active)}
                  />
                </div>
                <div className="relative w-full">
                  <div className="overflow-x-hidden">
                    <motion.nav
                      animate={{ x: serviceNav || atomAINav ? "-100%" : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-4xl font-semibold py-10"
                    >
                      <motion.ul
                        className="flex flex-col gap-2 "
                        variants={listVariants}
                        initial="hidden"
                        animate="show"
                      >
                        {navData.map((nav, index) => (
                          <motion.li
                            key={nav.text}
                            className="relative pl-10"
                            variants={itemVariants}
                          >
                            {nav.href ? (
                              <TransitionLink
                                href={nav.href}
                                onClick={() => setActive(false)}
                              >
                                <span className="opacity-30 absolute left-0 bottom-0 text-2xl">
                                  0{index + 1}
                                </span>
                                {nav.text}
                              </TransitionLink>
                            ) : (
                              <div
                                className="flex w-full justify-between items-center pr-10"
                                onClick={() => {
                                  if (nav.text === "Services") setServiceNav(true);
                                  if (nav.text === "Atom AI") setAtomAINav(true);
                                }}
                              >
                                <span className="opacity-30 absolute left-0 bottom-0 text-2xl">
                                  0{index + 1}
                                </span>
                                {nav.text} <FaArrowRight className="size-6" />
                              </div>
                            )}
                          </motion.li>
                        ))}
                      </motion.ul>
                      <motion.div
                        animate={{ opacity: serviceNav ? 1 : 0 }}
                        className="absolute top-1/2 -translate-y-1/2 left-full"
                      >
                        <ul className="text-2xl sm:text-3xl leading-tight flex flex-col gap-1">
                          <div
                            className="py-3 pr-3"
                            onClick={() => setServiceNav(false)}
                          >
                            <FaArrowLeft className="size-6 " />
                          </div>
                          {ServicesData.filter(s => s.link !== "/voice-agents" && s.link !== "/emotion-ai" && !s.hidden).map((service, index) => (
                            <li
                              key={service.title}
                              className="relative pl-10 whitespace-nowrap"
                            >
                              <TransitionLink
                                href={service.link}
                                className="block pr-4"
                                onClick={() => setActive(false)}
                              >
                                <span className="opacity-30 absolute left-0 bottom-0 text-xl sm:text-2xl">
                                  0{index + 1}
                                </span>
                                {service.title}
                              </TransitionLink>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                      <motion.div
                        animate={{ opacity: atomAINav ? 1 : 0 }}
                        className="absolute top-1/2 -translate-y-1/2 left-full w-full pr-8"
                      >
                        <ul className="text-2xl sm:text-3xl leading-tight flex flex-col gap-1 pr-2">
                          <div
                            className="py-3 pr-3"
                            onClick={() => setAtomAINav(false)}
                          >
                            <FaArrowLeft className="size-6 " />
                          </div>
                          {atomAIProducts.map((product, index) => {
                            // Explicit conditional rendering for proper type safety
                            if (product.available) {
                              return (
                                <li
                                  key={product.title}
                                  className="relative pl-10 whitespace-nowrap"
                                >
                                  <TransitionLink
                                    href={product.href}
                                    onClick={() => setActive(false)}
                                    className="block pr-4"
                                  >
                                    <span className="opacity-30 absolute left-0 bottom-0 text-xl sm:text-2xl">
                                      0{index + 1}
                                    </span>
                                    <span className="flex items-center gap-2">
                                      {product.title}
                                    </span>
                                  </TransitionLink>
                                </li>
                              );
                            }
                            
                            // Coming soon product (not clickable)
                            return (
                              <li
                                key={product.title}
                                className="relative pl-10 opacity-45"
                                title="This module is coming soon"
                              >
                                <div
                                  className="flex items-center justify-between pr-5 cursor-default"
                                  aria-disabled="true"
                                  tabIndex={-1}
                                >
                                  <span className="opacity-30 absolute left-0 bottom-0 text-xl sm:text-2xl">
                                    0{index + 1}
                                  </span>
                                  <span className="min-w-0 truncate">
                                    {product.title}
                                  </span>
                                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-[10px] font-medium text-zinc-400 whitespace-nowrap ml-2">
                                    Coming soon
                                  </span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    </motion.nav>
                  </div>
                  <div className="top-full absolute left-0 mt-20 w-full">
                    <NavButton onClick={() => setActive(false)} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HamMenu;
