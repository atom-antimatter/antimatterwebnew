import * as Cesium from "cesium";
import type { ILayer, LayerContext, LayerStats } from "./types";

type CellResult = {
  west: number; south: number; east: number; north: number;
  score: number;
  color: { r: number; g: number; b: number; a: number };
};

export class FeasibilityHeatmapLayer implements ILayer {
  readonly name = "powerHeatmap";
  private ds:     Cesium.CustomDataSource | null = null;
  private abort:  AbortController | null = null;
  private reqId   = 0;
  private stats:  LayerStats = { enabled: false, entityCount: 0, fetchStatus: "idle", lastUpdateAt: null, lastError: null };

  async enable(ctx: LayerContext) {
    const { viewer } = ctx;
    if (!this.ds) {
      this.ds = new Cesium.CustomDataSource("feasibility-heatmap");
      viewer.dataSources.add(this.ds);
    } else if (!viewer.dataSources.contains(this.ds)) {
      viewer.dataSources.add(this.ds);
    }
    await this.render(ctx);
  }

  disable(ctx: LayerContext) {
    this.abort?.abort();
    if (this.ds && ctx.viewer.dataSources.contains(this.ds)) {
      ctx.viewer.dataSources.remove(this.ds, false);
    }
    this.stats = { ...this.stats, entityCount: 0 };
  }

  async update(ctx: LayerContext) { await this.render(ctx); }

  dispose(ctx: LayerContext) {
    this.abort?.abort();
    if (this.ds) {
      if (ctx.viewer.dataSources.contains(this.ds)) ctx.viewer.dataSources.remove(this.ds, true);
      this.ds = null;
    }
  }

  getStats(): LayerStats { return this.stats; }

  private async render(ctx: LayerContext) {
    if (!this.ds) return;

    // Gated at WORLD
    if (ctx.cameraLevel === "WORLD") {
      this.ds.entities.removeAll();
      this.stats = { ...this.stats, entityCount: 0, note: "gated: zoom in past WORLD" };
      ctx.viewer.scene.requestRender();
      return;
    }

    const rect = ctx.viewRect;
    if (!rect) return;

    // Abort any in-flight request
    this.abort?.abort();
    const controller = new AbortController();
    this.abort = controller;
    const myId = ++this.reqId;

    this.stats = { ...this.stats, fetchStatus: "loading" };
    const mw   = ctx.powerScenario?.targetMw ?? 100;
    const grid = ctx.cameraLevel === "CITY" ? 15 : 10;
    const url  = `/api/power/viewport?west=${rect.west.toFixed(4)}&south=${rect.south.toFixed(4)}&east=${rect.east.toFixed(4)}&north=${rect.north.toFixed(4)}&mw=${mw}&grid=${grid}`;

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { cells?: CellResult[] } = await res.json();

      // Stale check
      if (myId !== this.reqId || controller.signal.aborted) return;
      const ds = this.ds;
      if (!ds) return;

      ds.entities.removeAll();
      const cells = data.cells ?? [];

      for (const cell of cells) {
        const { r, g, b, a } = cell.color;
        ds.entities.add({
          rectangle: new Cesium.RectangleGraphics({
            coordinates: new Cesium.ConstantProperty(
              Cesium.Rectangle.fromDegrees(cell.west, cell.south, cell.east, cell.north)
            ),
            material: new Cesium.ColorMaterialProperty(
              new Cesium.Color(r, g, b, Math.max(a, 0.28))
            ),
            height:   new Cesium.ConstantProperty(100),
            outline:  new Cesium.ConstantProperty(false),
          }),
        });
      }

      this.stats = {
        enabled:      true,
        entityCount:  cells.length,
        fetchStatus:  "success",
        lastUpdateAt: Date.now(),
        lastError:    null,
        note:         `grid=${grid} cells=${cells.length}`,
      };
      ctx.viewer.scene.requestRender();
      console.log(`[FeasibilityHeatmapLayer] rendered ${cells.length} cells @ ${ctx.cameraLevel}`);
    } catch (e: unknown) {
      if ((e as Error).name === "AbortError") return;
      const msg = (e as Error).message ?? String(e);
      this.stats = { ...this.stats, fetchStatus: "error", lastError: msg };
      console.error("[FeasibilityHeatmapLayer]", msg);
    }
  }
}
