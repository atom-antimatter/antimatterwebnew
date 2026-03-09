/**
 * atlasSelectionStore — single source of truth for what is "selected" on the map.
 *
 * Consumers:
 *  - AtlasMap: reads selectedId, highlights DC markers
 *  - PowerReadinessTab: reads pinnedPoint or selectedDc for power assessment
 *  - DataCenterMapClient: reads/writes all fields
 */
import { create } from "zustand";
import type { DataCenter } from "@/data/dataCenters";
import type { ProviderRegion } from "@/lib/providers/linode/types";

export type PinnedPoint = { lat: number; lng: number };

export type AtlasCameraLevel = "WORLD" | "REGION" | "LOCAL" | "CITY";

export type FilterDebugState = {
  rawQuery: string;
  geocodedPos: { lat: number; lng: number } | null;
  capabilities: string[];
  tier: string | null;
  resultCount: number;
  mode: "idle" | "browse" | "geocode" | "text";
};

interface AtlasSelectionState {
  selectedDc:     DataCenter     | null;
  selectedLinode: ProviderRegion | null;
  pinnedPoint:    PinnedPoint    | null;
  powerPanelOpen: boolean;
  cameraLevel:    AtlasCameraLevel;
  /** Filter pipeline state for the debug overlay. */
  filterDebug:    FilterDebugState;

  setSelectedDc:     (dc: DataCenter | null)         => void;
  setSelectedLinode: (r: ProviderRegion | null)       => void;
  setPinnedPoint:    (p: PinnedPoint | null)          => void;
  setPowerPanelOpen: (open: boolean)                  => void;
  setCameraLevel:    (level: AtlasCameraLevel)        => void;
  setFilterDebug:    (fd: FilterDebugState)           => void;
  clearAll:          () => void;

  /** Convenience: the lat/lng to use for power assessment */
  readonly powerTarget: PinnedPoint | null;
}

export const useAtlasSelectionStore = create<AtlasSelectionState>((set, get) => ({
  selectedDc:     null,
  selectedLinode: null,
  pinnedPoint:    null,
  powerPanelOpen: false,
  cameraLevel:    "WORLD",
  filterDebug:    { rawQuery: "", geocodedPos: null, capabilities: [], tier: null, resultCount: 0, mode: "idle" },

  setSelectedDc: (dc) => set({ selectedDc: dc }),
  setSelectedLinode: (r) => set({ selectedLinode: r }),
  setPinnedPoint: (p) => set({ pinnedPoint: p }),
  setPowerPanelOpen: (open) => set({ powerPanelOpen: open }),
  setCameraLevel: (level) => set({ cameraLevel: level }),
  setFilterDebug: (fd) => set({ filterDebug: fd }),
  clearAll: () => set({ selectedDc: null, selectedLinode: null, pinnedPoint: null }),

  get powerTarget() {
    const s = get();
    if (s.pinnedPoint) return s.pinnedPoint;
    if (s.selectedDc)  return { lat: s.selectedDc.lat, lng: s.selectedDc.lng };
    return null;
  },
}));
