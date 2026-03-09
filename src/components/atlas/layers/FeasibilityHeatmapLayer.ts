import * as Cesium from "cesium";
import type { ILayer, LayerContext, LayerStats } from "./types";

type CellResult = {
  west: number; south: number; east: number; north: number;
  score: number;
  color: { r: number; g: number; b: number; a: number };
};

function snap(v: number, step = 0.5): number {
  return Math.round(v / step) * step;
}

function materialBboxKey(rect: NonNullable<LayerContext["viewRect"]>, grid: number, mw: number): string {
  return [
    snap(rect.west),
    snap(rect.south),
    snap(rect.east),
    snap(rect.north),
    grid,
    mw,
  ].join(":");
}

export class FeasibilityHeatmapLayer implements ILayer {
  readonly name = "powerHeatmap";
  private primitive: Cesium.Primitive | null = null;
  private abort: AbortController | null = null;
  private reqId = 0;
  private lastKey = "";
  private stats: LayerStats = { enabled: false, entityCount: 0, fetchStatus: "idle", lastUpdateAt: null, lastError: null };

  async enable(ctx: LayerContext) {
    await this.render(ctx);
  }

  disable(ctx: LayerContext) {
    this.abort?.abort();
    this.removePrimitive(ctx);
    this.lastKey = "";
    this.stats = { ...this.stats, entityCount: 0 };
  }

  async update(ctx: LayerContext) {
    await this.render(ctx);
  }

  dispose(ctx: LayerContext) {
    this.abort?.abort();
    this.removePrimitive(ctx);
  }

  getStats(): LayerStats { return this.stats; }

  private removePrimitive(ctx: LayerContext) {
    if (this.primitive && ctx.viewer.scene.primitives.contains(this.primitive)) {
      ctx.viewer.scene.primitives.remove(this.primitive);
      if (typeof this.primitive.destroy === "function") this.primitive.destroy();
    }
    this.primitive = null;
    ctx.viewer.scene.requestRender();
  }

  private async render(ctx: LayerContext) {
    if (ctx.cameraLevel === "WORLD") {
      this.removePrimitive(ctx);
      this.stats = { ...this.stats, entityCount: 0, note: "gated: zoom in past WORLD" };
      return;
    }

    const rect = ctx.viewRect;
    if (!rect) return;

    const mw = ctx.powerScenario?.targetMw ?? 100;
    const grid = ctx.cameraLevel === "CITY" ? 15 : 10;
    const key = materialBboxKey(rect, grid, mw);
    if (key === this.lastKey && this.stats.entityCount > 0) return;

    this.abort?.abort();
    const controller = new AbortController();
    this.abort = controller;
    const myId = ++this.reqId;
    this.stats = { ...this.stats, fetchStatus: "loading" };

    const url = `/api/power/viewport?west=${rect.west.toFixed(4)}&south=${rect.south.toFixed(4)}&east=${rect.east.toFixed(4)}&north=${rect.north.toFixed(4)}&mw=${mw}&grid=${grid}`;

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { cells?: CellResult[] } = await res.json();
      if (myId !== this.reqId || controller.signal.aborted) return;

      const cells = data.cells ?? [];
      const instances: Cesium.GeometryInstance[] = [];

      for (const cell of cells) {
        const { r, g, b, a } = cell.color;
        instances.push(new Cesium.GeometryInstance({
          geometry: new Cesium.RectangleGeometry({
            rectangle: Cesium.Rectangle.fromDegrees(cell.west, cell.south, cell.east, cell.north),
            height: 100,
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              new Cesium.Color(r, g, b, Math.min(Math.max(a, 0.12), 0.22))
            ),
          },
        }));
      }

      const nextPrimitive = instances.length > 0 ? new Cesium.Primitive({
        geometryInstances: instances,
        appearance: new Cesium.PerInstanceColorAppearance({
          flat: true,
          translucent: true,
          closed: false,
        }),
        asynchronous: false,
        allowPicking: false,
        releaseGeometryInstances: true,
      }) : null;

      // Atomic swap: keep old heatmap visible until new one is ready
      if (nextPrimitive) {
        ctx.viewer.scene.primitives.add(nextPrimitive);
      }
      const prevPrimitive = this.primitive;
      this.primitive = nextPrimitive;
      if (prevPrimitive && ctx.viewer.scene.primitives.contains(prevPrimitive)) {
        ctx.viewer.scene.primitives.remove(prevPrimitive);
        if (typeof prevPrimitive.destroy === "function") prevPrimitive.destroy();
      }

      this.lastKey = key;
      this.stats = {
        enabled: true,
        entityCount: cells.length,
        fetchStatus: "success",
        lastUpdateAt: Date.now(),
        lastError: null,
        note: `grid=${grid} cells=${cells.length} primitive-batch`,
      };
      ctx.viewer.scene.requestRender();
      console.log(`[FeasibilityHeatmapLayer] rendered ${cells.length} cells as batched primitives @ ${ctx.cameraLevel}`);
    } catch (e: unknown) {
      if ((e as Error).name === "AbortError") return;
      const msg = (e as Error).message ?? String(e);
      this.stats = { ...this.stats, fetchStatus: "error", lastError: msg };
      console.error("[FeasibilityHeatmapLayer]", msg);
    }
  }
}
