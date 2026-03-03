"use client";

import { useRef, useState } from "react";
import { Layers, X } from "lucide-react";
import type { Basemap } from "./AtlasMap.client";
import styles from "@/components/ui/css/Button.module.css";

// ─── exported types ───────────────────────────────────────────────────────────

export type LayersState = {
  countryBorders: boolean;
  stateBorders: boolean;
  cities: boolean;
  points: boolean;
  routes: boolean;
  // Power & Energy layers
  powerHeatmap: boolean;
  powerGeneration: boolean;
  powerCarbon: boolean;
  powerQueue: boolean;
  // Provider layers
  linodeRegions: boolean;
};

export type PowerScenario = {
  targetMw: 25 | 50 | 100 | 200;
  radiusKm: 25 | 50 | 80 | 120;
};

export type LayersMenuProps = {
  layers: LayersState;
  onChange: (layers: LayersState) => void;
  basemap: Basemap;
  onBasemapChange: (b: Basemap) => void;
  onResetView?: () => void;
  powerScenario?: PowerScenario;
  onPowerScenarioChange?: (s: PowerScenario) => void;
};

// ─── SwitchRow ────────────────────────────────────────────────────────────────
// The entire row (label + track) is one focusable button.
// Track: 40×20 px. Knob: 16×16 px.  Meets 44 px minimum touch target via py-3.

function SwitchRow({
  label,
  helper,
  checked,
  onToggle,
}: {
  label: string;
  helper?: string;
  checked: boolean;
  onToggle: () => void;
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
        {helper && (
          <p className="text-[11px] text-[rgba(246,246,253,0.4)] mt-0.5 leading-tight">{helper}</p>
        )}
      </div>
      {/* Track */}
      <div
        className={`
          relative w-10 h-5 rounded-full flex-shrink-0 transition-colors duration-200
          ${checked ? "bg-[#696aac]" : "bg-[rgba(246,246,253,0.14)]"}
        `}
      >
        {/* Knob */}
        <span
          className={`
            absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow
            transition-transform duration-200
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </div>
    </button>
  );
}

// ─── BasemapRadio ─────────────────────────────────────────────────────────────

function BasemapRadio({
  value,
  label,
  helper,
  checked,
  onSelect,
}: {
  value: Basemap;
  label: string;
  helper?: string;
  checked: boolean;
  onSelect: (v: Basemap) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={() => onSelect(value)}
      className="w-full flex items-center gap-3 px-4 py-2.5 min-h-[44px] rounded-xl text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#696aac]"
    >
      {/* Radio dot */}
      <div
        className={`
          w-4 h-4 rounded-full flex-shrink-0 border-2 transition-colors
          ${checked ? "border-[#696aac] bg-[#696aac]" : "border-[rgba(246,246,253,0.3)] bg-transparent"}
        `}
      >
        {checked && <span className="block w-2 h-2 rounded-full bg-white m-auto mt-[1px]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#f6f6fd]">{label}</p>
        {helper && (
          <p className="text-[11px] text-[rgba(246,246,253,0.4)] mt-0.5">{helper}</p>
        )}
      </div>
    </button>
  );
}

// ─── section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-[0.1em] font-semibold text-[rgba(246,246,253,0.35)]">
      {children}
    </p>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

const MW_OPTIONS: PowerScenario["targetMw"][] = [25, 50, 100, 200];
const RADIUS_OPTIONS: PowerScenario["radiusKm"][] = [25, 50, 80, 120];

export default function LayersMenu({
  layers,
  onChange,
  basemap,
  onBasemapChange,
  onResetView,
  powerScenario,
  onPowerScenarioChange,
}: LayersMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const set = (key: keyof LayersState, val: boolean) =>
    onChange({ ...layers, [key]: val });

  const scenario: PowerScenario = powerScenario ?? { targetMw: 100, radiusKm: 80 };

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
          {/* Header — sticky, never scrolls away */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[rgba(246,246,253,0.07)]">
            <p className="text-sm font-semibold text-[#f6f6fd]">Layers</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close layers panel"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[rgba(246,246,253,0.5)] hover:text-[#f6f6fd] hover:bg-white/[0.06] transition-colors focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-[rgba(105,106,172,0.3)] scrollbar-track-transparent">

            {/* Basemap section */}
            <SectionLabel>Base map</SectionLabel>
            <div role="radiogroup" aria-label="Base map selection">
              <BasemapRadio
                value="osmDark"
                label="Carto Dark"
                helper="Default, matches dark theme"
                checked={basemap === "osmDark"}
                onSelect={onBasemapChange}
              />
              <BasemapRadio
                value="osmLight"
                label="Carto Light"
                checked={basemap === "osmLight"}
                onSelect={onBasemapChange}
              />
              <BasemapRadio
                value="osmStandard"
                label="OpenStreetMap"
                helper="Standard colour tiles"
                checked={basemap === "osmStandard"}
                onSelect={onBasemapChange}
              />
            </div>

            {/* Overlays section */}
            <div className="border-t border-[rgba(246,246,253,0.07)] mt-1">
              <SectionLabel>Overlays</SectionLabel>
              <SwitchRow
                label="Country borders"
                checked={layers.countryBorders}
                onToggle={() => set("countryBorders", !layers.countryBorders)}
              />
              <SwitchRow
                label="State / province borders"
                helper="110 m simplified"
                checked={layers.stateBorders}
                onToggle={() => set("stateBorders", !layers.stateBorders)}
              />
              <SwitchRow
                label="City labels"
                helper="Appear as you zoom in"
                checked={layers.cities}
                onToggle={() => set("cities", !layers.cities)}
              />
              <SwitchRow
                label="Data centers"
                checked={layers.points}
                onToggle={() => set("points", !layers.points)}
              />
              <SwitchRow
                label="Fiber routes"
                helper="Visible at local zoom"
                checked={layers.routes}
                onToggle={() => set("routes", !layers.routes)}
              />
            </div>

            {/* Power & Energy section */}
            <div className="border-t border-[rgba(246,246,253,0.07)] mt-1">
              <SectionLabel>Power &amp; Energy</SectionLabel>
              <SwitchRow
                label="Feasibility heatmap"
                helper="Score grid by electricity cost, carbon, generation, queue"
                checked={layers.powerHeatmap}
                onToggle={() => set("powerHeatmap", !layers.powerHeatmap)}
              />
              <SwitchRow
                label="Nearby generation"
                helper="EIA-860 plant points sized by MW"
                checked={layers.powerGeneration}
                onToggle={() => set("powerGeneration", !layers.powerGeneration)}
              />
              <SwitchRow
                label="Grid carbon intensity"
                helper="EPA eGRID annual avg lb CO₂/MWh"
                checked={layers.powerCarbon}
                onToggle={() => set("powerCarbon", !layers.powerCarbon)}
              />
              <SwitchRow
                label="Interconnection queue"
                helper="Queued MW proxy — not available capacity"
                checked={layers.powerQueue}
                onToggle={() => set("powerQueue", !layers.powerQueue)}
              />

              {/* Scenario controls — visible only when at least one power layer is on */}
              {(layers.powerHeatmap || layers.powerGeneration || layers.powerQueue) && (
                <div className="px-4 py-3 bg-[rgba(246,246,253,0.03)] border-t border-[rgba(246,246,253,0.06)]">
                  <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.35)] mb-2">
                    Scenario
                  </p>
                  {/* Target MW */}
                  <p className="text-[11px] text-[rgba(246,246,253,0.5)] mb-1">Target load (MW)</p>
                  <div className="flex gap-1.5 flex-wrap mb-2" role="group" aria-label="Target MW">
                    {MW_OPTIONS.map((mw) => (
                      <button
                        key={mw}
                        type="button"
                        aria-pressed={scenario.targetMw === mw}
                        onClick={() => onPowerScenarioChange?.({ ...scenario, targetMw: mw })}
                        className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors ${
                          scenario.targetMw === mw
                            ? "bg-[#696aac] text-white border-[#696aac]"
                            : "bg-[rgba(105,106,172,0.1)] text-[rgba(162,163,233,0.8)] border-[rgba(105,106,172,0.2)] hover:border-[rgba(105,106,172,0.4)]"
                        }`}
                      >
                        {mw} MW
                      </button>
                    ))}
                  </div>
                  {/* Radius */}
                  <p className="text-[11px] text-[rgba(246,246,253,0.5)] mb-1">Search radius</p>
                  <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Search radius">
                    {RADIUS_OPTIONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        aria-pressed={scenario.radiusKm === r}
                        onClick={() => onPowerScenarioChange?.({ ...scenario, radiusKm: r })}
                        className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors ${
                          scenario.radiusKm === r
                            ? "bg-[#696aac] text-white border-[#696aac]"
                            : "bg-[rgba(105,106,172,0.1)] text-[rgba(162,163,233,0.8)] border-[rgba(105,106,172,0.2)] hover:border-[rgba(105,106,172,0.4)]"
                        }`}
                      >
                        {r} km
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Providers section */}
            <div className="border-t border-[rgba(246,246,253,0.07)] mt-1">
              <SectionLabel>Providers</SectionLabel>
              <SwitchRow
                label="Akamai / Linode regions"
                helper="Cloud computing regions from Linode API"
                checked={layers.linodeRegions}
                onToggle={() => set("linodeRegions", !layers.linodeRegions)}
              />
            </div>

          </div>{/* end scrollable body */}

          {/* Footer — sticky, never scrolls away */}
          {onResetView && (
            <div className="flex-shrink-0 border-t border-[rgba(246,246,253,0.07)] p-3">
              <button
                type="button"
                onClick={() => { onResetView(); setIsOpen(false); }}
                className={`${styles.button} inverted w-full text-sm`}
                style={{ padding: "8px 0" }}
              >
                Reset view
              </button>
            </div>
          )}
        </div>
      )}

      {/* FAB trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close layers panel" : "Open layers panel"}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`
          w-11 h-11 rounded-full flex items-center justify-center
          border transition-colors duration-200
          shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#696aac]
          ${
            isOpen
              ? "bg-[#696aac] border-[#696aac] text-white"
              : "bg-[rgba(6,7,15,0.88)] border-[rgba(105,106,172,0.4)] text-[rgba(162,163,233,0.85)] hover:bg-[rgba(105,106,172,0.2)] hover:text-[#f6f6fd] hover:border-[rgba(105,106,172,0.6)]"
          }
        `}
      >
        <Layers className="w-4.5 h-4.5" />
      </button>
    </div>
  );
}
