import * as Cesium from "cesium";
import { borderColor, type ILayer, type LayerContext, type LayerStats } from "./types";

// GeoJSON ring = array of [lon,lat] pairs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPolygonRings(geometry: { type: string; coordinates: any }): [number,number][][] {
  if (!geometry) return [];
  if (geometry.type === "Polygon")      return geometry.coordinates as [number,number][][];
  if (geometry.type === "MultiPolygon") {
    const rings: [number,number][][] = [];
    for (const poly of geometry.coordinates as [number,number][][][]) rings.push(...poly);
    return rings;
  }
  return [];
}

export class CountryBordersLayer implements ILayer {
  readonly name = "countryBorders";

  private ds:    Cesium.CustomDataSource | null = null;
  private stats: LayerStats = { enabled: false, entityCount: 0, fetchStatus: "idle", lastUpdateAt: null, lastError: null };

  async enable(ctx: LayerContext) {
    const { viewer } = ctx;
    if (this.ds) {
      // Data already loaded — re-attach if removed
      if (!viewer.dataSources.contains(this.ds)) {
        viewer.dataSources.add(this.ds);
      }
      // Recolour for new basemap
      this.recolour(ctx.basemap);
      viewer.scene.requestRender();
      return;
    }

    this.stats = { ...this.stats, fetchStatus: "loading" };
    try {
      const res = await fetch("/geo/countries.geojson");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const geo  = await res.json();
      const ds   = new Cesium.CustomDataSource("country-borders");
      let count  = 0;
      const color = this.strokeColor(ctx.basemap);

      for (const feat of geo.features ?? []) {
        const rings = getPolygonRings(feat.geometry);
        for (const ring of rings) {
          if (ring.length < 2) continue;
          // rings are [lon, lat]
          const positions = ring.map(([lon, lat]) =>
            Cesium.Cartesian3.fromDegrees(lon, lat));
          ds.entities.add({
            polyline: new Cesium.PolylineGraphics({
              positions:      new Cesium.ConstantProperty(positions),
              width:          new Cesium.ConstantProperty(1.2),
              material:       color,
              clampToGround:  new Cesium.ConstantProperty(true),
              arcType:        new Cesium.ConstantProperty(Cesium.ArcType.GEODESIC),
            }),
          });
          count++;
        }
      }

      this.ds = ds;
      this.stats = { enabled: true, entityCount: count, fetchStatus: "success", lastUpdateAt: Date.now(), lastError: null };
      viewer.dataSources.add(ds);
      viewer.scene.requestRender();
      console.log(`[CountryBordersLayer] loaded ${count} ring entities`);
    } catch (e: unknown) {
      const msg = (e as Error).message ?? String(e);
      this.stats = { ...this.stats, fetchStatus: "error", lastError: msg };
      console.error("[CountryBordersLayer]", msg);
    }
  }

  disable(ctx: LayerContext) {
    if (this.ds && ctx.viewer.dataSources.contains(this.ds)) {
      ctx.viewer.dataSources.remove(this.ds, false);
    }
  }

  update(ctx: LayerContext) {
    // Borders don't need per-frame viewport filtering.
    // But recolour if basemap changed.
    if (this.ds) this.recolour(ctx.basemap);
  }

  dispose(ctx: LayerContext) {
    if (this.ds) {
      if (ctx.viewer.dataSources.contains(this.ds)) {
        ctx.viewer.dataSources.remove(this.ds, true);
      }
      this.ds = null;
    }
  }

  getStats(): LayerStats { return this.stats; }

  private strokeColor(basemap: string): Cesium.ColorMaterialProperty {
    const hex = borderColor(basemap, "#d0d0ff", "#334");
    const alpha = basemap === "osmDark" ? 0.45 : 0.55;
    return new Cesium.ColorMaterialProperty(
      Cesium.Color.fromCssColorString(hex).withAlpha(alpha)
    );
  }

  private recolour(basemap: string) {
    if (!this.ds) return;
    const color = this.strokeColor(basemap);
    for (const e of this.ds.entities.values) {
      if (e.polyline) e.polyline.material = color;
    }
  }
}
