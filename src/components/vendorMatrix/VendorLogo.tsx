"use client";

import { Vendor } from "@/data/vendorMatrix";
import { useState } from "react";

interface VendorLogoProps {
  vendor: Vendor;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Unified vendor logo component used across selector and comparison views.
 * 
 * SVG Fix: Uses plain <img> tag instead of Next/Image for SVGs to avoid
 * rendering issues. Next.js Image optimization can interfere with SVG rendering,
 * especially for files with specific fills/strokes that need to remain unchanged.
 * 
 * For PNGs/JPGs, continues using regular img tag for simplicity.
 */
export default function VendorLogo({ vendor, size = "md", className = "" }: VendorLogoProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "max-h-8",
    md: "max-h-12",
    lg: vendor.id === "zendesk" ? "max-h-24" : "max-h-16",
  };

  if (hasError) {
    return (
      <span className="text-sm font-semibold text-foreground">
        {vendor.name}
      </span>
    );
  }

  return (
    <img
      src={vendor.logoUrl}
      alt={vendor.name}
      className={`w-auto object-contain ${sizeClasses[size]} ${className}`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}

