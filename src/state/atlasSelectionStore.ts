/**
 * atlasSelectionStore — single source of truth for what is "selected" on the map.
 *
 * Consumers:
 *  - AtlasMap: reads selectedId, highlights DC markers, manages 3D mode
 *  - PowerReadinessTab: reads pinnedPoint or selectedDc for power assessment
 *  - DataCenterMapClient: reads/writes all fields
 *  - ThreeDEntryButton / ThreeDExitButton: reads/writes 3D state
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

export type Pre3DCameraState = { lat: number; lng: number; height: number };

interface AtlasSelectionState {
  selectedDc:     DataCenter     | null;
  selectedLinode: ProviderRegion | null;
  pinnedPoint:    PinnedPoint    | null;
  powerPanelOpen: boolean;
  cameraLevel:    AtlasCameraLevel;
  filterDebug:    FilterDebugState;

  // 3D mode
  is3DActive:       boolean;
  pre3DCameraState: Pre3DCameraState | null;

  setSelectedDc:     (dc: DataCenter | null)         => void;
  setSelectedLinode: (r: ProviderRegion | null)       => void;
  setPinnedPoint:    (p: PinnedPoint | null)          => void;
  setPowerPanelOpen: (open: boolean)                  => void;
  setCameraLevel:    (level: AtlasCameraLevel)        => void;
  setFilterDebug:    (fd: FilterDebugState)           => void;
  clearAll:          () => void;

  enter3D: (saveCam: Pre3DCameraState) => void;
  exit3D:  () => void;

  readonly powerTarget: PinnedPoint | null;
}

export const useAtlasSelectionStore = create<AtlasSelectionState>((set, get) => ({
  selectedDc:       null,
  selectedLinode:   null,
  pinnedPoint:      null,
  powerPanelOpen:   false,
  cameraLevel:      "WORLD",
  filterDebug:      { rawQuery: "", geocodedPos: null, capabilities: [], tier: null, resultCount: 0, mode: "idle" },
  is3DActive:       false,
  pre3DCameraState: null,

  setSelectedDc: (dc) => set({ selectedDc: dc }),
  setSelectedLinode: (r) => set({ selectedLinode: r }),
  setPinnedPoint: (p) => set({ pinnedPoint: p }),
  setPowerPanelOpen: (open) => set({ powerPanelOpen: open }),
  setCameraLevel: (level) => set({ cameraLevel: level }),
  setFilterDebug: (fd) => set({ filterDebug: fd }),
  clearAll: () => set({ selectedDc: null, selectedLinode: null, pinnedPoint: null }),

  enter3D: (saveCam) => set({ is3DActive: true, pre3DCameraState: saveCam }),
  exit3D: () => set({ is3DActive: false, pre3DCameraState: null }),

  get powerTarget() {
    const s = get();
    if (s.pinnedPoint) return s.pinnedPoint;
    if (s.selectedDc)  return { lat: s.selectedDc.lat, lng: s.selectedDc.lng };
    return null;
  },
}));
