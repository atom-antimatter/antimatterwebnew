"use client";

import { Vendor } from "@/data/vendorMatrix";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import FilterSidebar from "@/components/vendorMatrix/FilterSidebar";
import VendorGrid from "@/components/vendorMatrix/VendorGrid";
import CompareBar from "@/components/vendorMatrix/CompareBar";
import ComparisonTable from "@/components/vendorMatrix/ComparisonTable";
import AtomChatWidget from "@/components/vendorMatrix/AtomChatWidget";
import { vendors } from "@/data/vendorMatrix";
export default function VendorMatrixClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [view, setView] = useState<"grid" | "comparison">("grid");
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<(keyof Vendor['capabilities'])[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>(["atom"]); // Atom preselected by default
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState<string>("");

  // Initialize state from URL params
  useEffect(() => {
    const vendorsParam = searchParams.get("vendors");
    const filtersParam = searchParams.get("filters");
    const viewParam = searchParams.get("view");

    let vendorsList: string[] = [];
    if (vendorsParam) {
      vendorsList = vendorsParam.split(",").filter(Boolean);
    }
    
    // Ensure Atom is always included and first
    if (!vendorsList.includes("atom")) {
      vendorsList = ["atom", ...vendorsList];
      // Update URL to include atom
      updateURL(vendorsList, selectedFilters, viewParam === "comparison" ? "comparison" : view);
    } else {
      // Move atom to first position if not already
      vendorsList = ["atom", ...vendorsList.filter(v => v !== "atom")];
    }
    
    setSelectedVendors(vendorsList);
    
    if (filtersParam) {
      setSelectedFilters(filtersParam.split(",").filter(Boolean) as (keyof Vendor['capabilities'])[]);
    }
    if (viewParam === "comparison" && vendorsList.length >= 2) {
      setView("comparison");
    }
  }, [searchParams]);

  // Update URL when state changes
  const updateURL = (vendors: string[], filters: (keyof Vendor['capabilities'])[], currentView: "grid" | "comparison") => {
    const params = new URLSearchParams();
    if (vendors.length > 0) {
      params.set("vendors", vendors.join(","));
    }
    if (filters.length > 0) {
      params.set("filters", filters.join(","));
    }
    if (currentView === "comparison" && vendors.length >= 2) {
      params.set("view", "comparison");
    }
    const newUrl = params.toString() ? `/resources/vendor-matrix?${params.toString()}` : "/resources/vendor-matrix";
    router.replace(newUrl, { scroll: false });
  };

  const handleFilterToggle = (filter: keyof Vendor['capabilities']) => {
    const newFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter((f) => f !== filter)
      : [...selectedFilters, filter];
    setSelectedFilters(newFilters);
    updateURL(selectedVendors, newFilters, view);
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
    updateURL(selectedVendors, [], view);
  };

  const handleVendorToggle = (vendorId: string) => {
    // Atom is always required - prevent deselection
    if (vendorId === "atom" && selectedVendors.includes("atom")) {
      alert("Atom is required for comparisons as the baseline reference point.");
      return;
    }
    
    const newVendors = selectedVendors.includes(vendorId)
      ? selectedVendors.filter((v) => v !== vendorId)
      : [...selectedVendors, vendorId];
    setSelectedVendors(newVendors);
    updateURL(newVendors, selectedFilters, view);
  };

  const handleRemoveVendor = (vendorId: string) => {
    const newVendors = selectedVendors.filter((v) => v !== vendorId);
    setSelectedVendors(newVendors);
    if (newVendors.length < 2 && view === "comparison") {
      setView("grid");
      updateURL(newVendors, selectedFilters, "grid");
    } else {
      updateURL(newVendors, selectedFilters, view);
    }
  };

  const handleCompare = () => {
    setView("comparison");
    updateURL(selectedVendors, selectedFilters, "comparison");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToGrid = () => {
    setView("grid");
    updateURL(selectedVendors, selectedFilters, "grid");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: "Enterprise AI Vendor Matrix - Comparison",
        url,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
      });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-[1500px] mx-auto">
        {/* Back to Antimatter */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Antimatter
        </Link>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Enterprise AI Vendor Matrix
          </h1>
          <p className="text-lg text-foreground/70 mb-6">
            Select capabilities, choose vendors, generate a side-by-side comparison.
          </p>

          {/* Mobile filter toggle */}
          {view === "grid" && (
            <button
              onClick={() => setFilterSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg mb-6"
            >
              <HiAdjustmentsHorizontal className="w-5 h-5" />
              Filters {selectedFilters.length > 0 && `(${selectedFilters.length})`}
            </button>
          )}
        </div>

        {/* Main content */}
        <div className="flex gap-8">
          {view === "grid" && (
            <FilterSidebar
              selectedFilters={selectedFilters}
              onFilterToggle={handleFilterToggle}
              onClearAll={handleClearFilters}
              isOpen={filterSidebarOpen}
              onClose={() => setFilterSidebarOpen(false)}
            />
          )}

          {view === "grid" ? (
            <VendorGrid
              selectedFilters={selectedFilters}
              selectedVendors={selectedVendors}
              onVendorToggle={handleVendorToggle}
            />
          ) : (
            <>
              <ComparisonTable
                selectedVendors={selectedVendors}
                selectedFilters={selectedFilters}
                onBack={handleBackToGrid}
                onShare={handleShare}
                onOpenChat={() => setChatOpen(true)}
              />
              <AtomChatWidget
                selectedVendors={vendors.filter((v) => selectedVendors.includes(v.id))}
                selectedFilters={selectedFilters}
                initialPrompt={chatPrompt}
              />
            </>
          )}
        </div>

        {view === "grid" && (
          <CompareBar
            selectedVendors={selectedVendors}
            onRemove={handleRemoveVendor}
            onCompare={handleCompare}
          />
        )}
      </div>
    </div>
  );
}

