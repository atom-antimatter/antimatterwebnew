"use client";

import { capabilityCategories, Vendor, vendors } from "@/data/vendorMatrix";
import { useState } from "react";
import { HiCheckCircle, HiMinusCircle, HiXCircle, HiArrowLeft, HiShare } from "react-icons/hi2";
import Button from "../ui/Button";
import AtomCallout from "./AtomCallout";
import Image from "next/image";

interface ComparisonTableProps {
  selectedVendors: string[];
  selectedFilters: (keyof Vendor['capabilities'])[];
  onBack: () => void;
  onShare: () => void;
}

function calculateMatchScore(
  vendor: Vendor,
  selectedFilters: (keyof Vendor['capabilities'])[]
): number | null {
  if (selectedFilters.length === 0) return null;

  let earned = 0;
  selectedFilters.forEach((filter) => {
    const value = vendor.capabilities[filter];
    if (value === true) earned += 1;
    else if (value === "partial") earned += 0.5;
  });

  return Math.round((earned / selectedFilters.length) * 100);
}

function CapabilityIcon({ value }: { value: boolean | "partial" }) {
  if (value === true) {
    return <HiCheckCircle className="w-5 h-5 text-green-500 mx-auto" />;
  } else if (value === "partial") {
    return <HiMinusCircle className="w-5 h-5 text-yellow-500 mx-auto" />;
  } else {
    return <HiXCircle className="w-5 h-5 text-foreground/30 mx-auto" />;
  }
}

export default function ComparisonTable({
  selectedVendors,
  selectedFilters,
  onBack,
  onShare,
}: ComparisonTableProps) {
  const [copiedToast, setCopiedToast] = useState(false);

  const comparedVendors = vendors.filter((v) => selectedVendors.includes(v.id));

  const handleShare = () => {
    onShare();
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  return (
    <div className="flex-1 pb-20">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <Button variant="inverted" onClick={onBack} className="gap-2">
          <HiArrowLeft className="w-4 h-4" />
          Back to Selection
        </Button>
        <Button onClick={handleShare} className="gap-2">
          <HiShare className="w-4 h-4" />
          Share Comparison
        </Button>
      </div>

      {copiedToast && (
        <div className="fixed top-4 right-4 bg-accent text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Link copied to clipboard!
        </div>
      )}

      <AtomCallout />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="sticky top-0 bg-background z-10">
              <th className="text-left p-4 border-b border-zinc-800 font-medium text-sm uppercase tracking-wide text-foreground/60 w-64">
                Capability
              </th>
              {comparedVendors.map((vendor) => (
                <th
                  key={vendor.id}
                  className="p-4 border-b border-zinc-800 text-center min-w-[180px]"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 flex items-center justify-center">
                      <Image
                        src={vendor.logoUrl}
                        alt={vendor.name}
                        width={100}
                        height={32}
                        className="max-h-8 w-auto object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="text-sm font-semibold">${vendor.name}</span>`;
                          }
                        }}
                      />
                    </div>
                    <div className="text-xs font-medium">{vendor.name}</div>
                    {selectedFilters.length > 0 && (
                      <div className="text-sm">
                        <span className="text-foreground/60">Match: </span>
                        <span className="font-semibold text-accent">
                          {calculateMatchScore(vendor, selectedFilters)}%
                        </span>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Key info rows */}
            <tr className="border-b border-zinc-800">
              <td className="p-4 font-medium text-sm text-foreground/80">Deployment</td>
              {comparedVendors.map((vendor) => (
                <td key={vendor.id} className="p-4 text-center text-sm text-foreground/70">
                  {vendor.typicalDeployment}
                </td>
              ))}
            </tr>
            <tr className="border-b border-zinc-800">
              <td className="p-4 font-medium text-sm text-foreground/80">IP Ownership</td>
              {comparedVendors.map((vendor) => (
                <td key={vendor.id} className="p-4 text-center text-sm">
                  <span
                    className={`capitalize ${
                      vendor.ipOwnership === "yes"
                        ? "text-green-500 font-semibold"
                        : vendor.ipOwnership === "partial"
                        ? "text-yellow-500"
                        : "text-foreground/50"
                    }`}
                  >
                    {vendor.ipOwnership}
                  </span>
                </td>
              ))}
            </tr>
            <tr className="border-b border-zinc-800 bg-zinc-900/30">
              <td className="p-4 font-medium text-sm text-foreground/80">Best Fit</td>
              {comparedVendors.map((vendor) => (
                <td key={vendor.id} className="p-4 text-center text-xs text-foreground/70 leading-relaxed">
                  {vendor.bestFit}
                </td>
              ))}
            </tr>

            {/* Capability categories */}
            {capabilityCategories.map((category) => (
              <tbody key={category.id}>
                <tr>
                  <td
                    colSpan={comparedVendors.length + 1}
                    className="p-4 bg-zinc-900/50 font-semibold text-sm uppercase tracking-wide text-foreground/90 border-y border-zinc-800"
                  >
                    {category.title}
                  </td>
                </tr>
                {category.items.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-800 hover:bg-zinc-900/30">
                    <td className="p-4 text-sm text-foreground/70">{item.label}</td>
                    {comparedVendors.map((vendor) => (
                      <td key={vendor.id} className="p-4">
                        <CapabilityIcon value={vendor.capabilities[item.id]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}

            {/* Differentiator row */}
            <tr className="border-b border-zinc-800 bg-accent/5">
              <td className="p-4 font-semibold text-sm text-accent">Key Differentiator</td>
              {comparedVendors.map((vendor) => (
                <td key={vendor.id} className="p-4 text-xs text-foreground/80 leading-relaxed">
                  {vendor.atomDifferentiator}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-zinc-900/30 rounded-xl">
        <div className="flex items-center justify-center gap-8 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <HiCheckCircle className="w-5 h-5 text-green-500" />
            <span>Yes / Full Support</span>
          </div>
          <div className="flex items-center gap-2">
            <HiMinusCircle className="w-5 h-5 text-yellow-500" />
            <span>Partial Support</span>
          </div>
          <div className="flex items-center gap-2">
            <HiXCircle className="w-5 h-5 text-foreground/30" />
            <span>No / Not Available</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-6 text-xs text-center text-foreground/50 italic">
        Capabilities are directional; confirm with vendor documentation during procurement.
      </p>
    </div>
  );
}

