"use client";

import { X, Zap } from "lucide-react";
import type { DataCenter } from "@/data/dataCenters";
import PowerReadinessTab from "./PowerReadinessTab";

type PowerFeasibilityPanelProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  selectedDc?: DataCenter | null;
  pinnedPoint?: { lat: number; lng: number } | null;
  onPinCenter?: () => void;
  onClearPin?: () => void;
};

export default function PowerFeasibilityPanel({
  isOpen,
  onOpen,
  onClose,
  selectedDc,
  pinnedPoint,
  onPinCenter,
  onClearPin,
}: PowerFeasibilityPanelProps) {
  return (
    <div className="fixed right-5 bottom-20 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          className="
            w-[320px] sm:w-[360px] rounded-2xl
            bg-[rgba(6,7,15,0.94)] backdrop-blur-xl
            border border-[rgba(246,246,253,0.1)]
            shadow-2xl
            flex flex-col
            max-h-[calc(100dvh-140px)] overflow-hidden
            animate-in fade-in slide-in-from-bottom-3 duration-200
          "
        >
          <div className="flex items-center justify-between gap-3 border-b border-[rgba(246,246,253,0.07)] px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[rgba(162,163,233,0.55)]">
                Infrastructure Atlas
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-[#f6f6fd]">
                Power Feasibility
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close power feasibility panel"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[rgba(246,246,253,0.5)] transition-colors hover:bg-white/[0.06] hover:text-[#f6f6fd]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <PowerReadinessTab
            selectedDc={selectedDc}
            pinnedPoint={pinnedPoint}
            onPinCenter={onPinCenter}
            onClearPin={onClearPin}
          />
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="
            flex h-11 items-center gap-2 rounded-full border
            border-[rgba(105,106,172,0.4)] bg-[rgba(6,7,15,0.88)]
            px-4 text-sm font-medium text-[rgba(246,246,253,0.9)]
            shadow-lg transition-colors duration-200
            hover:border-[rgba(105,106,172,0.6)] hover:bg-[rgba(105,106,172,0.22)]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#696aac]
          "
        >
          <Zap className="h-4 w-4 text-[#a2a3e9]" />
          <span>Power Feasibility</span>
        </button>
      )}
    </div>
  );
}
