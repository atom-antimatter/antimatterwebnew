/**
 * LayerManager — single coordinator for all Cesium overlay layers.
 *
 * Design principles:
 *  - Each layer owns its CustomDataSource / PrimitiveCollection.
 *  - enable() adds it to the viewer; disable() removes it entirely.
 *  - requestRender() is called on EVERY state change.
 *  - Camera move is debounced (250ms) to avoid flooding update().
 *  - No React state is touched here — this is pure Cesium lifecycle code.
 */
import * as Cesium from "cesium";
import type { ILayer, LayerContext, LayerStats } from "./types";

export class LayerManager {
  private viewer:   Cesium.Viewer | null = null;
  private layers:   Map<string, ILayer>  = new Map();
  private enabled:  Set<string>          = new Set();
  private ctx:      LayerContext | null  = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Setup ──────────────────────────────────────────────────────────────────

  init(viewer: Cesium.Viewer, ctx: LayerContext) {
    this.viewer = viewer;
    this.ctx    = ctx;

    // Re-request a render after every camera move so REGION/LOCAL layers repaint.
    viewer.camera.moveEnd.addEventListener(() => {
      if (this.ctx) this.onCameraChange(this.ctx);
    });
  }

  register(layer: ILayer) {
    this.layers.set(layer.name, layer);
  }

  // ── Toggle ────────────────────────────────────────────────────────────────

  /** Called whenever a layer toggle or context value changes. */
  sync(
    layerStates: Record<string, boolean>,
    ctx: LayerContext,
  ) {
    this.ctx = ctx;
    if (!this.viewer || this.viewer.isDestroyed()) return;

    for (const [name, layer] of this.layers) {
      const shouldEnable = layerStates[name] ?? false;
      const isEnabled    = this.enabled.has(name);

      if (shouldEnable && !isEnabled) {
        this.enabled.add(name);
        console.log(`[LayerManager] enable ${name}`);
        layer.enable(ctx);
      } else if (!shouldEnable && isEnabled) {
        this.enabled.delete(name);
        console.log(`[LayerManager] disable ${name}`);
        layer.disable(ctx);
      } else if (shouldEnable && isEnabled) {
        // Context changed (e.g. basemap swap) — update visuals
        layer.update(ctx);
      }
    }

    this.requestRender();
  }

  // ── Camera change ─────────────────────────────────────────────────────────

  onCameraChange(ctx: LayerContext) {
    this.ctx = ctx;
    // Debounce so rapid pan/zoom doesn't flood update()
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (!this.viewer || this.viewer.isDestroyed()) return;
      for (const name of this.enabled) {
        const layer = this.layers.get(name);
        if (layer) layer.update(ctx);
      }
      this.requestRender();
    }, 250);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  requestRender() {
    if (this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.scene.requestRender();
    }
  }

  getStats(): Record<string, LayerStats> {
    const out: Record<string, LayerStats> = {};
    for (const [name, layer] of this.layers) {
      out[name] = { ...layer.getStats(), enabled: this.enabled.has(name) };
    }
    return out;
  }

  dispose() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (!this.viewer || this.viewer.isDestroyed() || !this.ctx) return;
    for (const layer of this.layers.values()) {
      layer.dispose(this.ctx);
    }
    this.layers.clear();
    this.enabled.clear();
  }
}
