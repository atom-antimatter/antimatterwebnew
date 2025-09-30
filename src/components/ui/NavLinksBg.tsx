"use client";

import { useEffect, useRef } from "react";

const NavLinksBg = () => {
  const bgRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const nav = document.getElementById("nav-links") as HTMLUListElement;
    const navlinks = nav.querySelectorAll("li");
    if (!bgRef.current) return;
    const bgElement = bgRef.current;
    const rect0 = navlinks[0].getBoundingClientRect();
    bgElement.style.width = `${rect0.width}px`;
    bgElement.style.height = `${rect0.height}px`;
    bgElement.style.transform = `translateX(${rect0.left}px) translateY(${rect0.top}px)`;

    function handleMouseEnter(navlink: HTMLLIElement) {
      const header = document.getElementById("header")?.getBoundingClientRect();
      if (!header) return;
      bgElement.style.opacity = "1";
      const rect = navlink.getBoundingClientRect();
      bgElement.style.width = `${rect.width}px`;
      bgElement.style.height = `${rect.height}px`;
      bgElement.style.transform = `translate(${rect.left}px,${
        1 + rect.top + -header.top
      }px)`;
    }
    function handleMouseLeave() {
      bgElement.style.opacity = "0";
    }
    navlinks.forEach((nav) => {
      nav.addEventListener("mouseenter", () => handleMouseEnter(nav));
      nav.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      navlinks.forEach((nav) => {
        nav.removeEventListener("mouseenter", () => handleMouseEnter(nav));
        nav.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);
  return (
    <div
      className="duration-300 bg-foreground/10 border border-foreground/5 absolute top-0 backdrop-blur-md 
      left-0 opacity-0 rounded-md"
      ref={bgRef}
    ></div>
  );
};

export default NavLinksBg;
