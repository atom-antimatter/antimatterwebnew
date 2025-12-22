"use client";

import { Vendor, vendors, quickFilters } from "@/data/vendorMatrix";
import { useState, useMemo } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import VendorCard from "./VendorCard";

interface VendorGridProps {
  selectedFilters: (keyof Vendor['capabilities'])[];
  selectedVendors: string[];
  onVendorToggle: (vendorId: string) => void;
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

export default function VendorGrid({
  selectedFilters,
  selectedVendors,
  onVendorToggle,
}: VendorGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);

  const toggleQuickFilter = (filterId: string) => {
    setActiveQuickFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  const filteredVendors = useMemo(() => {
    let result = [...vendors];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.primaryUseCase.toLowerCase().includes(query) ||
          v.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply quick filters
    if (activeQuickFilters.length > 0) {
      result = result.filter((vendor) => {
        return activeQuickFilters.every((filterId) => {
          const quickFilter = quickFilters.find((qf) => qf.id === filterId);
          if (!quickFilter) return true;
          const value = vendor.capabilities[quickFilter.capability];
          return value === true || value === "partial";
        });
      });
    }

    // Sort: Atom first, then by match score
    result.sort((a, b) => {
      if (a.id === "atom") return -1;
      if (b.id === "atom") return 1;

      const scoreA = calculateMatchScore(a, selectedFilters) ?? -1;
      const scoreB = calculateMatchScore(b, selectedFilters) ?? -1;
      return scoreB - scoreA;
    });

    return result;
  }, [searchQuery, activeQuickFilters, selectedFilters]);

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              placeholder="Search vendors by name, use case, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => toggleQuickFilter(filter.id)}
                  className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${
                    activeQuickFilters.includes(filter.id)
                      ? "bg-secondary text-white"
                      : "bg-zinc-900/50 border border-zinc-800 text-foreground/80 hover:border-secondary"
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-foreground/60">
          {selectedFilters.length > 0 && (
            <span>
              Showing {filteredVendors.length} vendor{filteredVendors.length !== 1 ? "s" : ""} matching {selectedFilters.length} selected{" "}
              {selectedFilters.length === 1 ? "capability" : "capabilities"}
            </span>
          )}
          {selectedFilters.length === 0 && (
            <span>
              Showing all {filteredVendors.length} vendors · Select capabilities to see match scores
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-32">
        {filteredVendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            isSelected={selectedVendors.includes(vendor.id)}
            matchScore={calculateMatchScore(vendor, selectedFilters)}
            onToggle={() => onVendorToggle(vendor.id)}
          />
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12 text-foreground/60 mb-32">
          No vendors match your search criteria. Try adjusting your filters or search query.
        </div>
      )}
    </div>
  );
}

