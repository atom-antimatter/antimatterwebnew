"use client";

import { vendors } from "@/data/vendorMatrix";
import { motion, AnimatePresence } from "motion/react";
import { HiXMark } from "react-icons/hi2";
import Button from "../ui/Button";

interface CompareBarProps {
  selectedVendors: string[];
  onRemove: (vendorId: string) => void;
  onCompare: () => void;
}

export default function CompareBar({
  selectedVendors,
  onRemove,
  onCompare,
}: CompareBarProps) {
  if (selectedVendors.length === 0) return null;

  const tooMany = selectedVendors.length > 6;
  const tooFew = selectedVendors.length < 2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950 border-t border-zinc-800 shadow-2xl"
      >
        <div className="w-main mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Selected vendors pills */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <span className="text-sm font-medium text-foreground/60">
                Selected ({selectedVendors.length}):
              </span>
              {selectedVendors.map((vendorId) => {
                const vendor = vendors.find((v) => v.id === vendorId);
                if (!vendor) return null;
                return (
                  <motion.div
                    key={vendorId}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-sm"
                  >
                    <span>{vendor.name}</span>
                    <button
                      onClick={() => onRemove(vendorId)}
                      className="hover:text-accent transition-colors"
                    >
                      <HiXMark className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Compare button */}
            <div className="flex items-center gap-4">
              {tooMany && (
                <span className="text-sm text-red-400">
                  Please select 6 or fewer vendors
                </span>
              )}
              {tooFew && selectedVendors.length > 0 && (
                <span className="text-sm text-foreground/60">
                  Select at least 2 vendors to compare
                </span>
              )}
              <Button
                onClick={onCompare}
                disabled={tooMany || tooFew}
                className="whitespace-nowrap"
              >
                Compare ({selectedVendors.length})
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

