"use client";

/**
 * LayersMenu — reads/writes ONLY from atlasLayersStore.
 * No local layer state here — the Zustand store is the single source of truth.
 */

import { useRef, useState } from "react";
import { Layers, X } from "lucide-react";
import { useAtlasLayersStore, type OverlayKey, type PowerLayerKey, type ProviderLayerKey, type Basemap } from "@/state/atlasLayersStore";
import styles from "@/components/ui/css/Button.module.css";

// ── Re-export types that the parent component still references ───────────────

/** Flat shape used as AtlasMap's `layers` prop — derived from store. */
export type LayersState = {
  countryBorders: boolean;
  stateBorders: boolean;
  cities: boolean;
  points: boolean;
  routes: boolean;
  powerHeatmap: boolean;
  powerGeneration: boolean;
  powerQueue: boolean;
  linodeRegions: boolean;
};

export type LayersMenuProps = {
  /** Called when user clicks "Reset view" — camera only, NOT layer state */
  onResetView?: () => void;
};

// ─── sub-components ──────────────────────────────────────────────────────────

function SwitchRow({
  label, helper, checked, onToggle,
}: {
  label: string; helper?: string; checked: boolean; onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 min-h-[44px] rounded-xl text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#696aac] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070f]"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#f6f6fd] leading-snug">{label}</p>
        {helper && <p className="text-[11px] text-[rgba(246,246,253,0.4)] mt-0.5 leading-tight">{helper}</p>}
      </div>
      <div className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors duration-200 ${checked ? "bg-[#696aac]" : "bg-[rgba(246,246,253,0.14)]"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </div>
    </button>
  );
}

function BasemapRadio({ value, label, helper, checked, onSelect }: {
  value: Basemap; label: string; helper?: string; checked: boolean; onSelect: (v: Basemap) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={() => onSelect(value)}
      className="w-full flex items-center gap-3 px-4 py-2.5 min-h-[44px] rounded-xl text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#696aac]"
    >
      <div className={`w-4 h-4 rounded-full flex-shrink-0 border-2 transition-colors ${checked ? "border-[#696aac] bg-[#696aac]" : "border-[rgba(246,246,253,0.3)] bg-transparent"}`}>
        {checked && <span className="block w-2 h-2 rounded-full bg-white m-auto mt-[1px]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#f6f6fd]">{label}</p>
        {helper && <p className="text-[11px] text-[rgba(246,246,253,0.4)] mt-0.5">{helper}</p>}
      </div>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-[0.1em] font-semibold text-[rgba(246,246,253,0.35)]">
      {children}
    </p>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function LayersMenu({ onResetView }: LayersMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    basemap, setBasemap,
    overlays, toggleOverlay,
    power,    togglePower,
    providers, toggleProvider,
  } = useAtlasLayersStore();

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-2">
      {/* Panel card */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Map layers"
          className="
            w-[300px] rounded-2xl
            bg-[rgba(6,7,15,0.94)] backdrop-blur-xl
            border border-[rgba(246,246,253,0.1)]
            shadow-2xl
            flex flex-col
            max-h-[calc(100dvh-100px)] overflow-hidden
            animate-in fade-in slide-in-from-bottom-3 duration-200
          "
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[rgba(246,246,253,0.07)]">
            <p className="text-sm font-semibold text-[#f6f6fd]">Layers</p>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close layers panel" className="w-7 h-7 flex items-center justify-center rounded-lg text-[rgba(246,246,253,0.5)] hover:text-[#f6f6fd] hover:bg-white/[0.06] transition-colors focus:outline-none">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-[rgba(105,106,172,0.3)] scrollbar-track-transparent">

            {/* Base map */}
            <SectionLabel>Base map</SectionLabel>
            <div role="radiogroup" aria-label="Base map selection">
              <BasemapRadio value="osmDark"     label="Carto Dark"      helper="Default, matches dark theme" checked={basemap === "osmDark"}     onSelect={setBasemap} />
              <BasemapRadio value="osmLight"    label="Carto Light"     checked={basemap === "osmLight"}    onSelect={setBasemap} />
              <BasemapRadio value="osmStandard" label="OpenStreetMap"   helper="Standard colour tiles"      checked={basemap === "osmStandard"} onSelect={setBasemap} />
            </div>

            {/* Overlays */}
            <div className="border-t border-[rgba(246,246,253,0.07)] mt-1">
              <SectionLabel>Overlays</SectionLabel>
              {(["countryBorders", "stateBorders", "cities", "points", "routes"] as OverlayKey[]).map(key => {
                const META: Record<OverlayKey, { label: string; helper?: string }> = {
                  countryBorders: { label: "Country borders" },
                  stateBorders:   { label: "State / province borders", helper: "110 m simplified" },
                  cities:         { label: "City labels",              helper: "Appear as you zoom in" },
                  points:         { label: "Data centers" },
                  routes:         { label: "Fiber routes",             helper: "Visible at local zoom" },
                };
                const { label, helper } = META[key];
                return (
                  <SwitchRow key={key} label={label} helper={helper} checked={overlays[key]} onToggle={() => toggleOverlay(key)} />
                );
              })}
            </div>

            {/* Power & Energy */}
            <div className="border-t border-[rgba(246,246,253,0.07)] mt-1">
              <SectionLabel>Power &amp; Energy</SectionLabel>
              {(["powerHeatmap","powerGeneration","powerQueue"] as PowerLayerKey[]).map(key => {
                const META: Record<PowerLayerKey, { label: string; helper?: string }> = {
                  powerHeatmap:    { label: "Feasibility heatmap",     helper: "Score grid by electricity cost, carbon, generation, queue" },
                  powerGeneration: { label: "Nearby generation",       helper: "EIA-860 plant points sized by MW" },
                  powerQueue:      { label: "Interconnection queue",   helper: "Queued MW proxy — not available capacity" },
                };
                const { label, helper } = META[key];
                return (
                  <SwitchRow key={key} label={label} helper={helper} checked={power[key]} onToggle={() => togglePower(key)} />
                );
              })}
            </div>

            {/* Providers */}
            <div className="border-t border-[rgba(246,246,253,0.07)] mt-1">
              <SectionLabel>Providers</SectionLabel>
              {(["linodeRegions"] as ProviderLayerKey[]).map(key => (
                <SwitchRow key={key} label="Akamai / Linode regions" helper="Cloud computing regions from Linode API" checked={providers[key]} onToggle={() => toggleProvider(key)} />
              ))}
            </div>

          </div>{/* end scrollable body */}

          {/* Footer */}
          {onResetView && (
            <div className="flex-shrink-0 border-t border-[rgba(246,246,253,0.07)] p-3">
              <button type="button" onClick={() => { onResetView(); setIsOpen(false); }}
                className={`${styles.button} inverted w-full text-sm`} style={{ padding: "8px 0" }}>
                Reset view
              </button>
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <button type="button" onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? "Close layers panel" : "Open layers panel"}
        aria-expanded={isOpen} aria-haspopup="dialog"
        className={`w-11 h-11 rounded-full flex items-center justify-center border transition-colors duration-200 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#696aac] ${isOpen ? "bg-[#696aac] border-[#696aac] text-white" : "bg-[rgba(6,7,15,0.88)] border-[rgba(105,106,172,0.4)] text-[rgba(162,163,233,0.85)] hover:bg-[rgba(105,106,172,0.2)] hover:text-[#f6f6fd] hover:border-[rgba(105,106,172,0.6)]"}`}>
        <Layers className="w-4.5 h-4.5" />
      </button>
    </div>
  );
}
