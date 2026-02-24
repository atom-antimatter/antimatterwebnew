"use client";
import React, { useEffect, useRef, useState } from "react";
import { ServiceProps, ServicesData } from "@/data/services";
import { useLoading } from "@/store";
import { motion } from "motion/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HiMicrophone, HiMagnifyingGlass, HiCurrencyDollar, HiChatBubbleLeftRight, HiCube } from "react-icons/hi2";
import HamMenu from "./ui/HamMenu";
import NavButton from "./ui/NavButton";
import NavLinksBg from "./ui/NavLinksBg";
import TransitionLink from "./ui/TransitionLink";

type NavItem = { href?: string; text: string };
const NavData: NavItem[] = [
  // { href: "/", text: "Home" },
  { href: "/work", text: "Work" },
  { href: "/company", text: "Company" },
  { text: "Services" },
  { text: "Atom AI" },
  { href: "/contact", text: "Contact" },
];

const NavBar = () => {
  const finished = useLoading((s) => s.finished);
  const path = usePathname();
  // const { setOpen } = useStartProjectModal();

  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [hovering, setHovering] = useState(false);

  // Handle scroll direction + gradient toggle
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      // hide on scroll down, show on scroll up
      if (!hovering) {
        // hide on scroll down, show on scroll up
        if (currentScroll > lastScrollY && currentScroll > 100) {
          setVisible(false);
        } else {
          setVisible(true);
        }
      } else {
        // while hovering, force it visible
        setVisible(true);
      }

      setScrolled(currentScroll > 100);
      setLastScrollY(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hovering, lastScrollY]);

  if (path === "/" && !finished) return null;

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{
        y: visible ? 0 : -100,
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className={`fixed top-0 z-50 left-0 w-full py-5`}
      id="header"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="absolute top-0 left-0 size-full bg-gradient-to-b from-background to-transparent from-20% to-90%"
      />
      <div className="w-main mx-auto relative z-20">
        <div className="flex justify-between items-center">
          <TransitionLink href="/">
            <Image
              src="/images/antimatter-ai-logo.svg"
              width={152}
              height={20}
              alt="Antimatter AI Logo"
              priority
              loading="eager"
              className="w-36 lg:w-40 h-auto"
            />
          </TransitionLink>

          {/* Desktop nav */}
          <nav className="hidden md:block">
            <ul className="flex text-sm" id="nav-links">
              {NavData.map(({ href, text }) => (
                <NavItemWithDropdown key={text} href={href} text={text} />
              ))}
            </ul>
          </nav>

          <NavButton className="hidden md:block" />
          <HamMenu navData={NavData} />
        </div>
      </div>
      <NavLinksBg />
    </motion.header>
  );
};

export default NavBar;

/* -----------------------------
   Nav Item with Dropdown Toggle
-------------------------------- */
const NavItemWithDropdown = ({
  href,
  text,
}: {
  href?: string;
  text: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  // Close dropdown on outside click and ESC key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (text === "Services") {
    return (
      <li
        ref={ref}
        className="relative group"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          className="px-4 lg:px-7 py-1.5 flex cursor-pointer"
          aria-expanded={open}
          aria-haspopup="true"
        >
          {text}
        </button>
        <ServicesDropdown open={open} />
      </li>
    );
  }

  if (text === "Atom AI") {
    return (
      <li
        ref={ref}
        className="relative group"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          className="px-4 lg:px-7 py-1.5 flex cursor-pointer"
          aria-expanded={open}
          aria-haspopup="true"
        >
          {text}
        </button>
        <AtomAIDropdown open={open} />
      </li>
    );
  }

  return (
    <li className="relative group">
      {href ? (
        <TransitionLink href={href} className="px-4 lg:px-7 py-1.5 flex">
          {text}
        </TransitionLink>
      ) : (
        <span className="px-4 lg:px-7 py-1.5 flex cursor-pointer">{text}</span>
      )}
    </li>
  );
};

/* -----------------------------
   Service Card
-------------------------------- */
const ServiceCard = ({ icon: Icon, title, items, link }: ServiceProps) => (
  <TransitionLink
    href={link}
    className="p-5 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition pl-14 relative block h-full min-h-[230px] max-h-[280px] overflow-hidden"
  >
    <div className="absolute top-5 left-3 text-white">
      <Icon className="size-7" />
    </div>
    <h3 className="text-xl font-semibold mb-2 whitespace-nowrap">{title}</h3>
    <div className="flex flex-col gap-1.5 opacity-70 text-pretty">
      {items.map((i) => (
        <div key={i.title} className="whitespace-normal">
          {i.title}
        </div>
      ))}
    </div>
  </TransitionLink>
);

/* -----------------------------
   Services Dropdown
-------------------------------- */
const ServicesDropdown = ({ open }: { open: boolean }) => (
  <div
    className={`
      absolute top-full left-1/2 -translate-x-1/2 pt-4
      opacity-0
      transition-[opacity,max-width,max-height,transform] duration-200
      ${open ? "opacity-100 pointer-events-auto" : "pointer-events-none"}
    `}
  >
    <div
      className={`
        w-[820px] lg:w-[1024px] xl:w-[1250px] bg-zinc-950 border border-foreground/20 rounded-xl
        max-w-0 overflow-hidden
        transition-all ease-in-out duration-300
        ${open ? "max-w-[1250px]" : "max-w-0"}
      `}
    >
      <div
        className={`
          grid grid-cols-6 lg:grid-cols-9 gap-2 p-3 lg:p-5 w-[820px] lg:w-[1024px] xl:w-[1250px] max-h-0 overflow-hidden
          transition-all ease-in-out duration-300
          ${open ? "max-h-[1000px]" : "max-h-0"}
        `}
      >
        <div className="flex-col gap-2 col-span-3 py-4 px-3 hidden lg:flex">
          <TransitionLink
            href={"/case-study/clinixAI"}
            className="hover:scale-105 duration-150"
          >
            <Image
              src="/images/CaseStudies/clinix/clinixai-1.jpg"
              alt="Clinix AI"
              width={150}
              height={100}
              className="rounded-lg w-full"
            />
            <p className="mt-2 text-lg font-semibold opacity-50">Clinix AI</p>
          </TransitionLink>
          <h3 className="text-2xl">
            OUR LATEST <br /> WORK
          </h3>
        </div>

        <div className="col-span-6 grid grid-cols-3">
          {ServicesData.filter((s) => s.link !== "/voice-agents" && s.link !== "/emotion-ai").map((s) => (
            <div
              key={s.title}
              className="flex flex-col gap-3 col-span-1 text-xs font-light  "
            >
              <ServiceCard {...s} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* -----------------------------
   Atom AI Dropdown
-------------------------------- */
// Strict product type with discriminated union on available
type AvailableProduct = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  href: string;
  available: true;
};

type ComingSoonProduct = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  href: string; // Present but won't be used
  available: false;
};

type AtomProduct = AvailableProduct | ComingSoonProduct;

const atomAIProducts: AtomProduct[] = [
  {
    icon: HiCube,
    title: "Atom Enterprise",
    desc: "Enterprise-grade AI deployment across VPC, on-prem, and edge",
    href: "/enterprise-ai",
    available: true as const,
  },
  {
    icon: HiChatBubbleLeftRight,
    title: "Atom Agentic",
    desc: "Autonomous AI agents that execute workflows end-to-end",
    href: "/agentic-ai",
    available: true as const,
  },
  {
    icon: HiCurrencyDollar,
    title: "Atom IntentIQ",
    desc: "Real-time buyer intent scoring and pipeline intelligence",
    href: "/atom-intentiq",
    available: true as const,
  },
];

// Discriminated union wrapper component for available/unavailable products
type ProductItemWrapperProps = 
  | { available: true; href: string; className?: string; title?: string; children: React.ReactNode }
  | { available: false; href?: never; className?: string; title?: string; children: React.ReactNode };

const ProductItemWrapper: React.FC<ProductItemWrapperProps> = (props) => {
  if (props.available) {
    return (
      <TransitionLink
        href={props.href}
        className={props.className}
        title={props.title}
      >
        {props.children}
      </TransitionLink>
    );
  }
  
  return (
    <div
      className={props.className}
      title={props.title}
      aria-disabled="true"
      tabIndex={-1}
    >
      {props.children}
    </div>
  );
};

const AtomAIDropdown = ({ open }: { open: boolean }) => (
  <div
    className={`
      absolute top-full left-1/2 -translate-x-1/2 pt-4
      opacity-0
      transition-[opacity,max-width,max-height,transform] duration-200
      ${open ? "opacity-100 pointer-events-auto" : "pointer-events-none"}
    `}
  >
    <div
      className={`
        w-[380px] bg-zinc-950 border border-foreground/20 rounded-xl
        transition-all ease-in-out duration-300 overflow-hidden
        ${open ? "max-h-[600px]" : "max-h-0"}
      `}
    >
      <div className="p-5">
        {atomAIProducts.map((product) => {
          // Explicit conditional rendering for proper type narrowing
          if (product.available) {
            return (
              <ProductItemWrapper
                key={product.title}
                available={true}
                href={product.href}
                className="flex items-start gap-4 p-4 rounded-lg border border-transparent transition hover:bg-white/5 hover:border-white/5 cursor-pointer"
              >
                <div className="mt-0.5 text-white/90">
                  <product.icon className="size-6" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-base font-semibold">{product.title}</h3>
                  </div>
                  <p className="text-sm text-pretty leading-snug opacity-70">
                    {product.desc}
                  </p>
                </div>
              </ProductItemWrapper>
            );
          }
          
          return (
            <ProductItemWrapper
              key={product.title}
              available={false}
              className="flex items-start gap-4 p-4 rounded-lg border border-transparent transition opacity-45 cursor-default"
              title="This module is coming soon"
            >
              <div className="mt-0.5 text-white/50">
                <product.icon className="size-6" />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-base font-semibold">{product.title}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-[10px] font-medium text-zinc-400 whitespace-nowrap">
                    Coming soon
                  </span>
                </div>
                <p className="text-sm text-pretty leading-snug opacity-50">
                  {product.desc}
                </p>
              </div>
            </ProductItemWrapper>
          );
        })}
      </div>
    </div>
  </div>
);
