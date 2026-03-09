/**
 * BuildingsLayer — open-source 3D building extrusions.
 *
 * Fetches building footprints from /api/buildings which dynamically
 * streams data from the Microsoft Global Building Footprints dataset
 * (1.4B buildings) and caches results in Supabase.
 *
 * Only active at CITY zoom level for performance.
 */
import * as Cesium from "cesium";
import type { ILayer, LayerContext, LayerStats } from "./types";

type BuildingFeature = {
  type: "Feature";
  geometry: { type: string; coordinates: number[][][] };
  properties: { height?: number; confidence?: number };
};

function colorForHeight(h: number, isDark: boolean): Cesium.Color {
  if (isDark) {
    if (h > 100) return Cesium.Color.fromCssColorString("rgba(200,200,225,0.88)");
    if (h > 50)  return Cesium.Color.fromCssColorString("rgba(180,180,205,0.84)");
    if (h > 20)  return Cesium.Color.fromCssColorString("rgba(160,160,185,0.80)");
    return Cesium.Color.fromCssColorString("rgba(145,145,170,0.76)");
  }
  if (h > 100) return Cesium.Color.fromCssColorString("rgba(180,180,195,0.85)");
  if (h > 50)  return Cesium.Color.fromCssColorString("rgba(165,165,180,0.80)");
  if (h > 20)  return Cesium.Color.fromCssColorString("rgba(150,150,168,0.76)");
  return Cesium.Color.fromCssColorString("rgba(140,140,158,0.72)");
}

export class BuildingsLayer implements ILayer {
  readonly name = "buildings";
  private ds:         Cesium.CustomDataSource | null = null;
  private stats:      LayerStats = { enabled: false, entityCount: 0, fetchStatus: "idle", lastUpdateAt: null, lastError: null };
  private renderReqId = 0;
  private lastFetchKey = "";

  async enable(ctx: LayerContext) {
    const { viewer } = ctx;
    if (!this.ds) {
      this.ds = new Cesium.CustomDataSource("buildings-3d");
      viewer.dataSources.add(this.ds);
    } else if (!viewer.dataSources.contains(this.ds)) {
      viewer.dataSources.add(this.ds);
    }
    await this.render(ctx);
  }

  disable(ctx: LayerContext) {
    if (this.ds && ctx.viewer.dataSources.contains(this.ds)) {
      ctx.viewer.dataSources.remove(this.ds, false);
    }
    this.lastFetchKey = "";
  }

  async update(ctx: LayerContext) { await this.render(ctx); }

  dispose(ctx: LayerContext) {
    if (this.ds) {
      if (ctx.viewer.dataSources.contains(this.ds)) ctx.viewer.dataSources.remove(this.ds, true);
      this.ds = null;
    }
  }

  getStats(): LayerStats { return this.stats; }

  private async render(ctx: LayerContext) {
    if (!this.ds) return;

    if (ctx.cameraLevel !== "CITY") {
      this.ds.entities.removeAll();
      this.stats = { ...this.stats, entityCount: 0, note: "gated: zoom to city level to see buildings" };
      ctx.viewer.scene.requestRender();
      return;
    }

    const rect = ctx.viewRect;
    if (!rect) return;

    const fetchKey = `${rect.west.toFixed(3)},${rect.south.toFixed(3)},${rect.east.toFixed(3)},${rect.north.toFixed(3)}`;
    if (fetchKey === this.lastFetchKey && this.stats.entityCount > 0) return;

    const myId = ++this.renderReqId;
    this.stats = { ...this.stats, fetchStatus: "loading" };

    try {
      const bbox = `${rect.west.toFixed(4)},${rect.south.toFixed(4)},${rect.east.toFixed(4)},${rect.north.toFixed(4)}`;
      const url = `/api/buildings?bbox=${bbox}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (myId !== this.renderReqId) return;

      const ds = this.ds;
      if (!ds) return;
      ds.entities.removeAll();

      const features: BuildingFeature[] = data.features ?? [];
      const isDark = ctx.basemap === "osmDark";

      for (const f of features) {
        try {
          const ring = f.geometry?.coordinates?.[0];
          if (!ring || ring.length < 4) continue;

          const degreesArray: number[] = [];
          for (const [lon, lat] of ring) {
            degreesArray.push(lon, lat);
          }

          const height = f.properties?.height ?? 10;

          ds.entities.add({
            polygon: new Cesium.PolygonGraphics({
              hierarchy: new Cesium.ConstantProperty(
                new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(degreesArray))
              ),
              height: new Cesium.ConstantProperty(0),
              extrudedHeight: new Cesium.ConstantProperty(height),
              material: new Cesium.ColorMaterialProperty(colorForHeight(height, isDark)),
              outline: new Cesium.ConstantProperty(false),
            }),
          });
        } catch { /* skip malformed */ }
      }

      this.lastFetchKey = fetchKey;
      const meta = data._meta ?? {};
      this.stats = {
        enabled: true,
        entityCount: features.length,
        fetchStatus: "success",
        lastUpdateAt: Date.now(),
        lastError: null,
        note: `${features.length} buildings (${meta.cached ?? 0} cached, ${meta.fetched ?? 0} fetched)`,
      };
      ctx.viewer.scene.requestRender();
      console.log(`[BuildingsLayer] rendered ${features.length} buildings (${meta.cached ?? 0} cached, ${meta.fetched ?? 0} remote)`);
    } catch (e: unknown) {
      if (myId !== this.renderReqId) return;
      const msg = (e as Error).message ?? String(e);
      this.stats = { ...this.stats, fetchStatus: "error", lastError: msg };
      console.error("[BuildingsLayer]", msg);
    }
  }
}
