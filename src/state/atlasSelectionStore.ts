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

interface AtlasSelectionState {
  selectedDc:     DataCenter     | null;
  selectedLinode: ProviderRegion | null;
  pinnedPoint:    PinnedPoint    | null;
  /** Whether the standalone power panel is open. */
  powerPanelOpen: boolean;

  setSelectedDc:     (dc: DataCenter | null)         => void;
  setSelectedLinode: (r: ProviderRegion | null)       => void;
  setPinnedPoint:    (p: PinnedPoint | null)          => void;
  setPowerPanelOpen: (open: boolean)                  => void;
  clearAll:          () => void;

  /** Convenience: the lat/lng to use for power assessment */
  readonly powerTarget: PinnedPoint | null;
}

export const useAtlasSelectionStore = create<AtlasSelectionState>((set, get) => ({
  selectedDc:     null,
  selectedLinode: null,
  pinnedPoint:    null,
  powerPanelOpen: false,

  setSelectedDc: (dc) => set({ selectedDc: dc }),
  setSelectedLinode: (r) => set({ selectedLinode: r }),
  setPinnedPoint: (p) => set({ pinnedPoint: p }),
  setPowerPanelOpen: (open) => set({ powerPanelOpen: open }),
  clearAll: () => set({ selectedDc: null, selectedLinode: null, pinnedPoint: null }),

  get powerTarget() {
    const s = get();
    if (s.pinnedPoint) return s.pinnedPoint;
    if (s.selectedDc)  return { lat: s.selectedDc.lat, lng: s.selectedDc.lng };
    return null;
  },
}));
