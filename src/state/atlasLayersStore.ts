/**
 * atlasLayersStore.ts — Single source of truth for all Atlas layer toggles.
 *
 * Uses Zustand with localStorage persistence so user preferences survive reloads.
 * Both LayersMenu and AtlasMap subscribe to this store; there is no more local
 * useState for layer state in DataCenterMapClient.
 */
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

// ─── Layer keys ────────────────────────────────────────────────────────────────

export type OverlayKey =
  | "countryBorders"
  | "stateBorders"
  | "cities"
  | "points"
  | "routes";

export type PowerLayerKey =
  | "powerHeatmap"
  | "powerGeneration"
  | "powerQueue";

export type ProviderLayerKey = "linodeRegions";

export type Basemap = "osmDark" | "osmLight" | "osmStandard";

// ─── Store shape ───────────────────────────────────────────────────────────────

export interface AtlasLayersState {
  // Basemap
  basemap: Basemap;

  // Overlay toggles
  overlays: Record<OverlayKey, boolean>;

  // Power layer toggles
  power: Record<PowerLayerKey, boolean>;

  // Provider layer toggles
  providers: Record<ProviderLayerKey, boolean>;

  // Power scenario
  powerScenario: { targetMw: number; radiusKm: number };

  // Debug mode
  debugEnabled: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────
  setBasemap: (b: Basemap) => void;
  toggleOverlay: (key: OverlayKey) => void;
  setOverlay: (key: OverlayKey, value: boolean) => void;
  togglePower: (key: PowerLayerKey) => void;
  setPower: (key: PowerLayerKey, value: boolean) => void;
  toggleProvider: (key: ProviderLayerKey) => void;
  setProvider: (key: ProviderLayerKey, value: boolean) => void;
  setPowerScenario: (s: { targetMw: number; radiusKm: number }) => void;
  toggleDebug: () => void;
  resetToDefaults: () => void;
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_OVERLAYS: Record<OverlayKey, boolean> = {
  countryBorders: true,
  stateBorders: false,
  cities: true,
  points: true,
  routes: false, // opt-in — avoids 1,200-entity load on first mount
};

const DEFAULT_POWER: Record<PowerLayerKey, boolean> = {
  powerHeatmap: false,
  powerGeneration: false,
  powerQueue: false,
};

const DEFAULT_PROVIDERS: Record<ProviderLayerKey, boolean> = {
  linodeRegions: false,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAtlasLayersStore = create<AtlasLayersState>()(
  devtools(
    persist(
      (set) => ({
        basemap: "osmDark",
        overlays: { ...DEFAULT_OVERLAYS },
        power: { ...DEFAULT_POWER },
        providers: { ...DEFAULT_PROVIDERS },
        powerScenario: { targetMw: 100, radiusKm: 80 },
        debugEnabled:
          typeof window !== "undefined"
            ? (window.location.search.includes("debug=1") ||
               localStorage.getItem("atlasDebug") === "true")
            : false,

        setBasemap: (b) => {
          console.log(`[Layers] basemap -> ${b}`);
          set({ basemap: b });
        },
        toggleOverlay: (key) =>
          set((s) => {
            const next = !s.overlays[key];
            console.log(`[Layers] toggle ${key} -> ${next}`);
            return { overlays: { ...s.overlays, [key]: next } };
          }),
        setOverlay: (key, value) => {
          console.log(`[Layers] set ${key} -> ${value}`);
          set((s) => ({ overlays: { ...s.overlays, [key]: value } }));
        },
        togglePower: (key) =>
          set((s) => {
            const next = !s.power[key];
            console.log(`[Layers] toggle ${key} -> ${next}`);
            return { power: { ...s.power, [key]: next } };
          }),
        setPower: (key, value) => {
          console.log(`[Layers] set ${key} -> ${value}`);
          set((s) => ({ power: { ...s.power, [key]: value } }));
        },
        toggleProvider: (key) =>
          set((s) => {
            const next = !s.providers[key];
            console.log(`[Layers] toggle ${key} -> ${next}`);
            return { providers: { ...s.providers, [key]: next } };
          }),
        setProvider: (key, value) => {
          console.log(`[Layers] set ${key} -> ${value}`);
          set((s) => ({ providers: { ...s.providers, [key]: value } }));
        },
        setPowerScenario: (s) => set({ powerScenario: s }),
        toggleDebug: () =>
          set((s) => {
            const next = !s.debugEnabled;
            if (typeof window !== "undefined") {
              localStorage.setItem("atlasDebug", next ? "true" : "false");
            }
            return { debugEnabled: next };
          }),
        resetToDefaults: () =>
          set({
            overlays: { ...DEFAULT_OVERLAYS },
            power: { ...DEFAULT_POWER },
            providers: { ...DEFAULT_PROVIDERS },
          }),
      }),
      {
        name: "atlas-layers-v1",
        // Only persist toggles + basemap; skip debugEnabled (use URL param instead)
        partialize: (s) => ({
          basemap: s.basemap,
          overlays: s.overlays,
          power: s.power,
          providers: s.providers,
          powerScenario: s.powerScenario,
        }),
      }
    ),
    { name: "AtlasLayers" }
  )
);

// ─── Derived flat shape (for AtlasMap props compatibility) ────────────────────

export function flattenLayers(s: AtlasLayersState) {
  return {
    ...s.overlays,
    ...s.power,
    ...s.providers,
  } as Record<string, boolean>;
}
