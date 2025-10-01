"use client";
import Image from "next/image";
import Link from "next/link";
import NavButton from "./ui/NavButton";
import { useStartProjectModal } from "@/store";
import NavLinksBg from "./ui/NavLinksBg";
import { useLoading } from "@/store";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import HamMenu from "./ui/HamMenu";
import { ServiceProps, ServicesData } from "@/data/services";
import { useState, useRef, useEffect } from "react";

type NavItem = { href?: string; text: string };
const NavData: NavItem[] = [
  { href: "/", text: "Home" },
  { href: "/work", text: "Work" },
  { text: "Services" },
  { href: "/contact", text: "Contact" },
];

const NavBar = () => {
  const finished = useLoading((s) => s.finished);
  const path = usePathname();
  const { setOpen } = useStartProjectModal();

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
          <Link href="/">
            <Image
              src="/images/antimatter-ai-logo.svg"
              width={152}
              height={20}
              alt="Antimatter AI Logo"
              priority
              loading="eager"
              className="w-36 lg:w-40 h-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:block">
            <ul className="flex text-sm" id="nav-links">
              {NavData.map(({ href, text }) => (
                <NavItemWithDropdown key={text} href={href} text={text} />
              ))}
            </ul>
          </nav>

          <NavButton
            className="hidden md:block"
            onClick={() => setOpen(true)}
          />
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (text === "Services") {
    return (
      <li
        ref={ref}
        className="relative group"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <span className="px-4 lg:px-7 py-1.5 flex cursor-pointer">{text}</span>
        <ServicesDropdown open={open} />
      </li>
    );
  }

  return (
    <li className="relative group">
      {href ? (
        <Link href={href} className="px-4 lg:px-7 py-1.5 flex">
          {text}
        </Link>
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
  <Link
    href={link}
    className="p-5 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition pl-14 relative block h-full min-h-[230px] max-h-[280px] overflow-hidden"
  >
    <div className="absolute top-5 left-3 text-accent">
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
  </Link>
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
        w-[820px] lg:w-[1120px] bg-zinc-950 border border-foreground/20 rounded-xl
        max-w-0 overflow-hidden
        transition-all ease-in-out duration-300
        ${open ? "max-w-[1120px]" : "max-w-0"}
      `}
    >
      <div
        className={`
          grid grid-cols-6 lg:grid-cols-9 gap-2 p-3 lg:p-5 w-[820px] lg:w-[1120px] max-h-0 overflow-hidden
          transition-all ease-in-out duration-300
          ${open ? "max-h-[1000px]" : "max-h-0"}
        `}
      >
        <div className="flex-col gap-2 col-span-3 py-4 px-3 hidden lg:flex">
          <Link
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
            <p className="mt-2 text-lg font-semibold opacity-50">ClinixAI</p>
          </Link>
          <h3 className="text-2xl">
            OUR LATEST <br /> WORK
          </h3>
        </div>

        <div className="col-span-6 grid grid-cols-3">
          {ServicesData.map((s) => (
            <div
              key={s.title}
              className="flex flex-col gap-3 col-span-1 text-xs font-light"
            >
              <ServiceCard {...s} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
