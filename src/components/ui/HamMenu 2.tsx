"use client";
import { ServicesData } from "@/data/services";
import { AnimatePresence, motion, Variants } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import HamButton from "./HamButton";
import NavButton from "./NavButton";

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
  useEffect(() => {
    if (!active) setServiceNav(false);
  }, [active]);
  return (
    <>
      <HamButton active={active} onClick={() => setActive(!active)} />
      <AnimatePresence>
        {active && (
          <div className="fixed z-50 right-0 top-0 h-screen w-screen md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/70 absolute top-0 left-0 size-full"
              onClick={() => setActive(!active)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-screen max-w-[320px] w-full bg-zinc-950 p-5 sm:px-8 relative z-10"
            >
              <div className="relative flex items-center h-full">
                <div className="absolute top-0 right-0">
                  <HamButton
                    active={active}
                    onClick={() => setActive(!active)}
                  />
                </div>
                <div className="relative w-full ">
                  <div className="overflow-hidden">
                    <motion.nav
                      animate={{ x: serviceNav ? "-100%" : 0 }}
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
                              <Link
                                href={nav.href}
                                onClick={() => setActive(false)}
                              >
                                <span className="opacity-30 absolute left-0 bottom-0 text-2xl">
                                  0{index + 1}
                                </span>
                                {nav.text}
                              </Link>
                            ) : (
                              <div
                                className="flex w-full justify-between items-center pr-10"
                                onClick={() => setServiceNav(true)}
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
                        <ul className="text-3xl flex flex-col gap-1">
                          <div
                            className="py-3 pr-3"
                            onClick={() => setServiceNav(false)}
                          >
                            <FaArrowLeft className="size-6 " />
                          </div>
                          {ServicesData.map((service, index) => (
                            <li key={service.title} className="relative pl-10">
                              <Link
                                href={service.link}
                                onClick={() => setActive(false)}
                              >
                                <span className="opacity-30 absolute left-0 bottom-0 text-2xl">
                                  0{index + 1}
                                </span>
                                {service.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </motion.nav>
                  </div>
                  <div className="top-full absolute left-0 mt-20 w-full">
                    <NavButton />
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
