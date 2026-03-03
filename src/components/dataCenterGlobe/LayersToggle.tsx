"use client";

import { useState } from "react";
import { Layers } from "lucide-react";

export type LayersState = {
  countryBorders: boolean;
  stateBorders: boolean;
  points: boolean;
  routes: boolean;
};

export type LayersToggleProps = {
  layers: LayersState;
  onChange: (layers: LayersState) => void;
};

function Toggle({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer py-1.5 group">
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        onClick={onToggle}
        className={`
          relative w-8 h-4 rounded-full transition-colors flex-shrink-0
          ${checked ? "bg-[#696aac]" : "bg-[rgba(246,246,253,0.1)]"}
        `}
      >
        <span
          className={`
            absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform
            ${checked ? "translate-x-4" : "translate-x-0.5"}
          `}
        />
      </button>
      <span className="text-xs text-[rgba(246,246,253,0.7)] group-hover:text-[#f6f6fd] transition-colors select-none">
        {label}
      </span>
    </label>
  );
}

export default function LayersToggle({ layers, onChange }: LayersToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const set = (key: keyof LayersState, val: boolean) =>
    onChange({ ...layers, [key]: val });

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-2">
      {/* Dropdown panel */}
      {isOpen && (
        <div className="
          bg-[rgba(6,7,15,0.92)] backdrop-blur-xl
          border border-[rgba(246,246,253,0.09)]
          rounded-xl px-4 py-3 shadow-2xl
          w-48
          animate-in fade-in slide-in-from-bottom-2 duration-200
        ">
          <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.35)] mb-2">
            Map Layers
          </p>
          <Toggle label="Country borders" checked={layers.countryBorders} onToggle={() => set("countryBorders", !layers.countryBorders)} />
          <Toggle label="State borders" checked={layers.stateBorders} onToggle={() => set("stateBorders", !layers.stateBorders)} />
          <Toggle label="Data centers" checked={layers.points} onToggle={() => set("points", !layers.points)} />
          <Toggle label="Fiber routes" checked={layers.routes} onToggle={() => set("routes", !layers.routes)} />
        </div>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Toggle map layers"
        aria-expanded={isOpen}
        className={`
          w-10 h-10 rounded-full
          flex items-center justify-center
          border transition-colors
          ${isOpen
            ? "bg-[#696aac] border-[#696aac] text-white"
            : "bg-[rgba(6,7,15,0.85)] border-[rgba(105,106,172,0.35)] text-[rgba(162,163,233,0.8)] hover:bg-[rgba(105,106,172,0.2)] hover:text-[#f6f6fd]"
          }
        `}
      >
        <Layers className="w-4 h-4" />
      </button>
    </div>
  );
}
