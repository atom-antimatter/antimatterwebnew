"use client";
import { usePageTransition } from "@/store";
import Link, { LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

interface Props
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    LinkProps {
  children: React.ReactNode;
}

const TransitionLink = ({ children, href, ...props }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const setIsTransition = usePageTransition((s) => s.setIsTransition);
  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      href === pathname ||
      (typeof href === "string" &&
        (href.startsWith("#") || href.startsWith(`${pathname}#`)))
    ) {
      return;
    }
    e.preventDefault();
    setIsTransition(true);
    setTimeout(() => {
      router.push(href.toString());
    }, 500);
  };
  return (
    <Link href={href} {...props} onClick={handleTransition}>
      {children}
    </Link>
  );
};

export default TransitionLink;
