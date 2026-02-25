"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface LayoutContentProps {
  children: ReactNode[];
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAtomSearchRoute = pathname?.startsWith("/atom/search");
  const isVendorMatrixRoute = pathname?.startsWith("/resources/vendor-matrix");
  const isChannelPartnersRoute = pathname?.startsWith("/resources/channel-partners");
  const isIntentIQRoute = pathname?.startsWith("/atom-intentiq");

  if (isAdminRoute || isAtomSearchRoute || isVendorMatrixRoute || isChannelPartnersRoute || isIntentIQRoute) {
    // For these routes, only render the main content (Providers and children)
    return <div className="relative">{children[1]}</div>;
  }

  // For non-admin routes, render everything
  const [NavBar, ProvidersAndChildren, StartProjectModal, Footer] = children;
  
  return (
    <>
      {NavBar}
      <div className="relative">{ProvidersAndChildren}</div>
      {StartProjectModal}
      {Footer}
    </>
  );
}

