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
  if (path === "/" && !finished) return null;

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.8, ease: "anticipate" }}
      className="fixed top-0 z-50 py-5 left-0 w-full"
      id="header"
    >
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

          <NavButton className="hidden md:block" onClick={() => setOpen(true)} />
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
        onClick={() => setOpen((o) => !o)} // tap-to-toggle
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
    className="p-4 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition pl-14 relative block"
  >
    <div className="absolute top-5 left-3 text-accent">
      <Icon className="size-7" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <div className="flex flex-col gap-[1px] opacity-70">
      {items.map((i) => (
        <div key={i.title} className="text-nowrap">
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
      absolute top-full left-1/2 -translate-x-1/2 pt-1
      opacity-0
      transition-opacity duration-100 delay-300
      ${open ? "opacity-100 pointer-events-auto delay-0" : ""}
      group-hover:opacity-100 group-hover:pointer-events-auto group-hover:delay-0
    `}
  >
    <div
      className={`
        w-[740px] lg:w-[1000px] bg-zinc-950 border border-foreground/20 rounded-xl
        max-w-0 overflow-hidden
        transition-all ease-in-out duration-500
        ${open ? "max-w-[1000px] duration-700" : ""}
        group-hover:max-w-[1000px] group-hover:duration-700
      `}
    >
      <div
        className={`
          grid grid-cols-6 lg:grid-cols-9 gap-1 p-2 lg:p-4 w-[740px] lg:w-[1000px] max-h-0 overflow-hidden
          transition-all ease-in-out duration-500
          ${open ? "max-h-[1000px] duration-[1100ms]" : ""}
          group-hover:max-h-[1000px] group-hover:duration-[1100ms]
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
