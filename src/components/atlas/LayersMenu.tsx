"use client";

/**
 * LayersMenu — reads/writes ONLY from atlasLayersStore.
 * No local layer state here — the Zustand store is the single source of truth.
 */

import { useRef } from "react";
import { Layers, X } from "lucide-react";
import { useAtlasLayersStore, type OverlayKey, type PowerLayerKey, type ProviderLayerKey, type Basemap } from "@/state/atlasLayersStore";
import { useAtlasSelectionStore } from "@/state/atlasSelectionStore";
import { useModalStore } from "@/state/modalStore";
import styles from "@/components/ui/css/Button.module.css";

// ── Re-export types that the parent component still references ───────────────

/** Flat shape used as AtlasMap's `layers` prop — derived from store. */
export type LayersState = {
  countryBorders: boolean;
  stateBorders: boolean;
  cities: boolean;
  points: boolean;
  routes: boolean;
  buildings: boolean;
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
  label, helper, zoomNote, checked, onToggle,
}: {
  label: string; helper?: string; zoomNote?: string; checked: boolean; onToggle: () => void;
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
        {zoomNote && <p className="text-[11px] text-[rgba(162,163,233,0.55)] mt-0.5 leading-tight italic">{zoomNote}</p>}
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
  const { activeModal, openModal, closeModal } = useModalStore();
  const isOpen = activeModal === "layers";
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    basemap, setBasemap,
    overlays, toggleOverlay,
    power,    togglePower,
    providers, toggleProvider,
  } = useAtlasLayersStore();
  const { cameraLevel } = useAtlasSelectionStore();

  const isGlobal = cameraLevel === "WORLD" || cameraLevel === "REGION";

  return (
    <>
      {/* Panel card — anchored top-right so it gets full scroll height */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Map layers"
          className="
            fixed top-16 right-4 z-40
            w-[300px] rounded-2xl
            bg-[rgba(6,7,15,0.94)] backdrop-blur-xl
            border border-[rgba(246,246,253,0.1)]
            shadow-2xl
            flex flex-col
            max-h-[calc(100dvh-90px)]
            animate-in fade-in slide-in-from-right-3 duration-200
          "
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[rgba(246,246,253,0.07)]">
            <p className="text-sm font-semibold text-[#f6f6fd]">Layers</p>
            <button type="button" onClick={closeModal} aria-label="Close layers panel" className="w-7 h-7 flex items-center justify-center rounded-lg text-[rgba(246,246,253,0.5)] hover:text-[#f6f6fd] hover:bg-white/[0.06] transition-colors focus:outline-none">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-[rgba(105,106,172,0.3)] scrollbar-track-transparent">

            {/* Base map */}
            <SectionLabel>Base map</SectionLabel>
            <div role="radiogroup" aria-label="Base map selection">
              <BasemapRadio value="osmDark"     label="Carto Dark"    helper="Recommended · dark theme · retina" checked={basemap === "osmDark"}     onSelect={setBasemap} />
              <BasemapRadio value="osmLight"    label="Carto Light"   helper="Light theme · retina"             checked={basemap === "osmLight"}    onSelect={setBasemap} />
              <BasemapRadio value="osmStandard" label="OpenStreetMap" helper="May appear soft on Retina"        checked={basemap === "osmStandard"} onSelect={setBasemap} />
            </div>

            {/* Boundaries */}
            <div className="border-t border-[rgba(246,246,253,0.07)] mt-1">
              <SectionLabel>Boundaries</SectionLabel>
              <SwitchRow
                label="Country borders"
                checked={overlays.countryBorders}
                onToggle={() => toggleOverlay("countryBorders")}
              />
              <SwitchRow
                label="State / province borders"
                helper="110 m simplified"
                checked={overlays.stateBorders}
                onToggle={() => toggleOverlay("stateBorders")}
              />
              <SwitchRow
                label="Extra city labels"
                helper="Additional overlay labels — basemap already includes place names"
                zoomNote={overlays.cities && isGlobal ? "Zoom in to see" : undefined}
                checked={overlays.cities}
                onToggle={() => toggleOverlay("cities")}
              />
            </div>

            {/* Infrastructure */}
            <div className="border-t border-[rgba(246,246,253,0.07)] mt-1">
              <SectionLabel>Infrastructure</SectionLabel>
              <SwitchRow
                label="Data centers"
                checked={overlays.points}
                onToggle={() => toggleOverlay("points")}
              />
              <SwitchRow
                label="3D Buildings"
                helper="OSM Buildings · visible at city zoom"
                zoomNote={overlays.buildings && isGlobal ? "Zoom in to see" : undefined}
                checked={overlays.buildings}
                onToggle={() => toggleOverlay("buildings")}
              />
              <SwitchRow
                label="Fiber routes"
                helper="Geolocated routes · may be approximate"
                zoomNote={overlays.routes && isGlobal ? "Zoom in to see" : undefined}
                checked={overlays.routes}
                onToggle={() => toggleOverlay("routes")}
              />
              <SwitchRow
                label="Nearby generation"
                helper="EIA-860 plant data · sized by MW"
                zoomNote={overlays.routes && isGlobal && power.powerGeneration ? "Zoom in to see" : undefined}
                checked={power.powerGeneration}
                onToggle={() => togglePower("powerGeneration")}
              />
            </div>

            {/* Power */}
            <div className="border-t border-[rgba(246,246,253,0.07)] mt-1">
              <SectionLabel>Power &amp; Energy</SectionLabel>
              <SwitchRow
                label="Feasibility heatmap"
                helper="Scored by cost, carbon, generation, queue"
                zoomNote={power.powerHeatmap && isGlobal ? "Zoom in to see" : undefined}
                checked={power.powerHeatmap}
                onToggle={() => togglePower("powerHeatmap")}
              />
              <SwitchRow
                label="Interconnection queue"
                helper="Queued MW proxy · not available capacity"
                zoomNote={power.powerQueue && isGlobal ? "Zoom in to see" : undefined}
                checked={power.powerQueue}
                onToggle={() => togglePower("powerQueue")}
              />
            </div>

            {/* Providers */}
            <div className="border-t border-[rgba(246,246,253,0.07)] mt-1">
              <SectionLabel>Providers</SectionLabel>
              <SwitchRow
                label="Akamai / Linode regions"
                helper="Cloud computing regions"
                checked={providers.linodeRegions}
                onToggle={() => toggleProvider("linodeRegions")}
              />
            </div>

          </div>{/* end scrollable body */}

          {/* Footer */}
          {onResetView && (
            <div className="flex-shrink-0 border-t border-[rgba(246,246,253,0.07)] p-3">
              <button type="button" onClick={() => { onResetView(); closeModal(); }}
                className={`${styles.button} inverted w-full text-sm`} style={{ padding: "8px 0" }}>
                Reset view
              </button>
            </div>
          )}
        </div>
      )}

      {/* FAB — fixed bottom-right */}
      <div className="fixed bottom-6 right-5 z-40">
        <button type="button" onClick={() => isOpen ? closeModal() : openModal("layers")}
          aria-label={isOpen ? "Close layers panel" : "Open layers panel"}
          aria-expanded={isOpen} aria-haspopup="dialog"
          className={`w-11 h-11 rounded-full flex items-center justify-center border transition-colors duration-200 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#696aac] ${isOpen ? "bg-[#696aac] border-[#696aac] text-white" : "bg-[rgba(6,7,15,0.88)] border-[rgba(105,106,172,0.4)] text-[rgba(162,163,233,0.85)] hover:bg-[rgba(105,106,172,0.2)] hover:text-[#f6f6fd] hover:border-[rgba(105,106,172,0.6)]"}`}>
          <Layers className="w-4.5 h-4.5" />
        </button>
      </div>
    </>
  );
}
