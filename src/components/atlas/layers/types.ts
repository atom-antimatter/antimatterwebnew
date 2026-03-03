/**
 * Shared types for the LayerManager system.
 */
import type * as Cesium from "cesium";

export type CameraLevel = "WORLD" | "REGION" | "LOCAL" | "CITY";

export type ViewRect = {
  west: number;  south: number;
  east: number;  north: number;
};

export type LayerContext = {
  viewer:       Cesium.Viewer;
  cameraLevel:  CameraLevel;
  viewRect:     ViewRect | null;
  heightMeters: number;
  basemap:      string;           // 'osmDark' | 'osmLight' | 'osmStandard'
  powerScenario?: { targetMw: number; radiusKm: number };
};

export type FetchStatus = "idle" | "loading" | "success" | "error";

export type LayerStats = {
  enabled:       boolean;
  entityCount:   number;
  fetchStatus:   FetchStatus;
  lastUpdateAt:  number | null;  // Unix ms
  lastError:     string | null;
  note?:         string;         // e.g. "gated: zoom in"
};

export interface ILayer {
  readonly name: string;
  /** Called the first time (or after re-enable) — loads data and renders. */
  enable(ctx: LayerContext): Promise<void> | void;
  /** Called on toggle-off — must remove ALL entities/primitives from the scene. */
  disable(ctx: LayerContext): void;
  /** Called on camera moveEnd when the layer is enabled. */
  update(ctx: LayerContext): Promise<void> | void;
  /** Called when the viewer is destroyed — free all resources. */
  dispose(ctx: LayerContext): void;
  getStats(): LayerStats;
}

// ─── Colour helpers ──────────────────────────────────────────────────────────

/** Returns a stroke colour that is visible on both dark and light basemaps. */
export function borderColor(basemap: string, dark: string, light: string): string {
  return basemap === "osmDark" ? dark : light;
}
