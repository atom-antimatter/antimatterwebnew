import * as Cesium from "cesium";
import { borderColor, type ILayer, type LayerContext, type LayerStats } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRings(geometry: { type: string; coordinates: any }): [number,number][][] {
  if (!geometry) return [];
  if (geometry.type === "Polygon")      return geometry.coordinates as [number,number][][];
  if (geometry.type === "MultiPolygon") {
    const rings: [number,number][][] = [];
    for (const poly of geometry.coordinates as [number,number][][][]) rings.push(...poly);
    return rings;
  }
  return [];
}

export class StateBordersLayer implements ILayer {
  readonly name = "stateBorders";
  private ds:    Cesium.CustomDataSource | null = null;
  private stats: LayerStats = { enabled: false, entityCount: 0, fetchStatus: "idle", lastUpdateAt: null, lastError: null };

  async enable(ctx: LayerContext) {
    const { viewer } = ctx;
    if (this.ds) {
      if (!viewer.dataSources.contains(this.ds)) viewer.dataSources.add(this.ds);
      this.recolour(ctx.basemap);
      viewer.scene.requestRender();
      return;
    }
    this.stats = { ...this.stats, fetchStatus: "loading" };
    try {
      const res = await fetch("/geo/states_provinces.geojson");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const geo  = await res.json();
      const ds   = new Cesium.CustomDataSource("state-borders");
      let count  = 0;
      const color = this.strokeColor(ctx.basemap);

      for (const feat of geo.features ?? []) {
        const rings = getRings(feat.geometry);
        for (const ring of rings) {
          if (ring.length < 2) continue;
          const positions = ring.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat));
          ds.entities.add({
            polyline: new Cesium.PolylineGraphics({
              positions:     new Cesium.ConstantProperty(positions),
              width:         new Cesium.ConstantProperty(0.7),
              material:      color,
              clampToGround: new Cesium.ConstantProperty(true),
              arcType:       new Cesium.ConstantProperty(Cesium.ArcType.GEODESIC),
            }),
          });
          count++;
        }
      }
      this.ds = ds;
      this.stats = { enabled: true, entityCount: count, fetchStatus: "success", lastUpdateAt: Date.now(), lastError: null };
      viewer.dataSources.add(ds);
      viewer.scene.requestRender();
      console.log(`[StateBordersLayer] loaded ${count} ring entities`);
    } catch (e: unknown) {
      const msg = (e as Error).message ?? String(e);
      this.stats = { ...this.stats, fetchStatus: "error", lastError: msg };
    }
  }

  disable(ctx: LayerContext) {
    if (this.ds && ctx.viewer.dataSources.contains(this.ds)) {
      ctx.viewer.dataSources.remove(this.ds, false);
    }
  }

  update(ctx: LayerContext) { if (this.ds) this.recolour(ctx.basemap); }

  dispose(ctx: LayerContext) {
    if (this.ds) {
      if (ctx.viewer.dataSources.contains(this.ds)) ctx.viewer.dataSources.remove(this.ds, true);
      this.ds = null;
    }
  }

  getStats(): LayerStats { return this.stats; }

  private strokeColor(basemap: string) {
    const hex   = borderColor(basemap, "#b0b0dd", "#556");
    const alpha = basemap === "osmDark" ? 0.3 : 0.4;
    return new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(hex).withAlpha(alpha));
  }

  private recolour(basemap: string) {
    if (!this.ds) return;
    const c = this.strokeColor(basemap);
    for (const e of this.ds.entities.values) { if (e.polyline) e.polyline.material = c; }
  }
}
