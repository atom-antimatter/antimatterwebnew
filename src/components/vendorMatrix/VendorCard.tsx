"use client";

import { Vendor } from "@/data/vendorMatrix";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { HiCheckCircle } from "react-icons/hi2";

interface VendorCardProps {
  vendor: Vendor;
  isSelected: boolean;
  matchScore: number | null;
  onToggle: () => void;
}

export default function VendorCard({
  vendor,
  isSelected,
  matchScore,
  onToggle,
}: VendorCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-10 pointer-events-none"
        >
          <div className="text-xs space-y-1.5">
            <div>
              <span className="text-foreground/60">Deployment:</span>{" "}
              <span className="text-foreground">{vendor.typicalDeployment}</span>
            </div>
            <div>
              <span className="text-foreground/60">IP Ownership:</span>{" "}
              <span className="text-foreground capitalize">{vendor.ipOwnership}</span>
            </div>
            <div>
              <span className="text-foreground/60">Differentiator:</span>{" "}
              <span className="text-foreground">{vendor.atomDifferentiator}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Card */}
      <button
        onClick={onToggle}
        className={`
          relative w-full p-6 rounded-xl border-2 transition-all
          bg-zinc-900/50 hover:bg-zinc-900/70
          ${isSelected ? "border-accent" : "border-zinc-800 hover:border-zinc-700"}
        `}
      >
        {/* Selection checkmark */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2"
          >
            <HiCheckCircle className="w-6 h-6 text-accent" />
          </motion.div>
        )}

        {/* Atom badge */}
        {vendor.id === "atom" && (
          <div className="absolute top-2 left-2 bg-accent/20 border border-accent/50 px-2 py-0.5 rounded text-xs text-accent font-medium">
            Client-Owned
          </div>
        )}

        {/* Logo */}
        <div className="flex items-center justify-center h-16 mb-4">
          <Image
            src={vendor.logoUrl}
            alt={vendor.name}
            width={120}
            height={48}
            className="max-h-12 w-auto object-contain"
            onError={(e) => {
              // Fallback to text if logo fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<span class="text-lg font-semibold text-foreground">${vendor.name}</span>`;
              }
            }}
          />
        </div>

        {/* Vendor name */}
        <h3 className="text-sm font-medium text-center mb-2">{vendor.name}</h3>

        {/* Match score */}
        {matchScore !== null && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-foreground/60">Match:</span>
              <span className="text-sm font-semibold text-accent">{matchScore}%</span>
            </div>
          </div>
        )}
      </button>
    </motion.div>
  );
}

