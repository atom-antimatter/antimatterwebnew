"use client";

import { capabilityCategories, Vendor } from "@/data/vendorMatrix";
import Accordion from "./Accordion";

interface FilterSidebarProps {
  selectedFilters: (keyof Vendor['capabilities'])[];
  onFilterToggle: (filter: keyof Vendor['capabilities']) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSidebar({
  selectedFilters,
  onFilterToggle,
  onClearAll,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-auto
          w-80 bg-background border-r border-zinc-800
          z-50 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto
        `}
      >
        <div className="p-6 sticky top-0 bg-background border-b border-zinc-800 lg:border-b-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filter Capabilities</h3>
            <button
              onClick={onClose}
              className="lg:hidden text-foreground/60 hover:text-foreground"
            >
              ✕
            </button>
          </div>
          {selectedFilters.length > 0 && (
            <button
              onClick={onClearAll}
              className="w-full text-sm px-4 py-2 bg-transparent border-2 border-accent text-accent rounded-full hover:bg-accent/10 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="p-6 pt-0">
          {capabilityCategories.map((category) => (
            <Accordion
              key={category.id}
              title={category.title}
              defaultOpen={category.id === "deployment"}
            >
              <div className="space-y-2">
                {category.items.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(item.id)}
                      onChange={() => onFilterToggle(item.id)}
                      className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-accent focus:ring-accent focus:ring-offset-0"
                    />
                    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </Accordion>
          ))}
        </div>
      </aside>
    </>
  );
}

