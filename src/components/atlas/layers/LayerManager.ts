/**
 * LayerManager — single coordinator for all Cesium overlay layers.
 *
 * Design principles:
 *  - Each layer owns its CustomDataSource / PrimitiveCollection.
 *  - enable() adds it to the viewer; disable() removes it entirely.
 *  - requestRender() is called on EVERY state change.
 *  - Camera move is debounced (250ms) to avoid flooding update().
 *  - Context is always computed fresh via a factory callback so layers
 *    never operate on stale camera state.
 */
import * as Cesium from "cesium";
import type { ILayer, LayerContext, LayerStats } from "./types";

export type CtxFactory = () => LayerContext;

export class LayerManager {
  private viewer:     Cesium.Viewer | null = null;
  private layers:     Map<string, ILayer>  = new Map();
  private enabled:    Set<string>          = new Set();
  private ctxFactory: CtxFactory | null    = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  init(viewer: Cesium.Viewer, ctxFactory: CtxFactory) {
    this.viewer     = viewer;
    this.ctxFactory = ctxFactory;

    viewer.camera.moveEnd.addEventListener(() => {
      this.onCameraChange();
    });
  }

  register(layer: ILayer) {
    this.layers.set(layer.name, layer);
  }

  /** Called whenever a layer toggle or context value changes. */
  sync(layerStates: Record<string, boolean>, ctx: LayerContext) {
    if (!this.viewer || this.viewer.isDestroyed()) return;

    for (const [name, layer] of this.layers) {
      const shouldEnable = layerStates[name] ?? false;
      const isEnabled    = this.enabled.has(name);

      if (shouldEnable && !isEnabled) {
        this.enabled.add(name);
        layer.enable(ctx);
      } else if (!shouldEnable && isEnabled) {
        this.enabled.delete(name);
        layer.disable(ctx);
      } else if (shouldEnable && isEnabled) {
        layer.update(ctx);
      }
    }

    this.requestRender();
  }

  /** Debounced handler for Cesium camera.moveEnd. Computes fresh ctx. */
  private onCameraChange() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (!this.viewer || this.viewer.isDestroyed() || !this.ctxFactory) return;
      const ctx = this.ctxFactory();
      for (const name of this.enabled) {
        const layer = this.layers.get(name);
        if (layer) layer.update(ctx);
      }
      this.requestRender();
    }, 200);
  }

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
    if (!this.viewer || this.viewer.isDestroyed() || !this.ctxFactory) return;
    const ctx = this.ctxFactory();
    for (const layer of this.layers.values()) {
      layer.dispose(ctx);
    }
    this.layers.clear();
    this.enabled.clear();
  }
}
