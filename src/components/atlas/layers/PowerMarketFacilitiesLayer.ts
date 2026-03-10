/**
 * PowerMarketFacilitiesLayer — Renders facility-level power market markers.
 * Uses geocoded lat/lng from the facilities API. Visible at LOCAL/CITY zoom.
 */
import * as Cesium from "cesium";
import type { ILayer, LayerContext, LayerStats } from "./types";

type FacilityData = {
  provider: string;
  facility_name: string;
  city: string;
  state: string;
  power_feasibility_score: number;
  pue: number;
  renewable_energy_pct: number;
  est_rate_kwh: number;
  tier_rating: string;
  annual_cost_1mw: number;
  composite_score: number;
  lat?: number | null;
  lng?: number | null;
};

export class PowerMarketFacilitiesLayer implements ILayer {
  readonly name = "powerMarketFacilities";
  private ds: Cesium.CustomDataSource | null = null;
  private stats: LayerStats = { enabled: false, entityCount: 0, fetchStatus: "idle", lastUpdateAt: null, lastError: null };
  private loaded = false;

  async enable(ctx: LayerContext) {
    if (this.loaded && this.ds) {
      if (!ctx.viewer.dataSources.contains(this.ds)) ctx.viewer.dataSources.add(this.ds);
      ctx.viewer.scene.requestRender();
      return;
    }
    await this.load(ctx);
  }

  disable(ctx: LayerContext) {
    if (this.ds && ctx.viewer.dataSources.contains(this.ds)) {
      ctx.viewer.dataSources.remove(this.ds, false);
    }
  }

  async update(_ctx: LayerContext) {}

  dispose(ctx: LayerContext) {
    if (this.ds) {
      if (ctx.viewer.dataSources.contains(this.ds)) ctx.viewer.dataSources.remove(this.ds, true);
      this.ds = null;
      this.loaded = false;
    }
  }

  getStats(): LayerStats { return this.stats; }

  private async load(ctx: LayerContext) {
    this.stats = { ...this.stats, fetchStatus: "loading" };
    try {
      const res = await fetch("/api/v1/facilities?limit=50&sort=composite");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { data } = await res.json() as { data: FacilityData[] };

      const ds = new Cesium.CustomDataSource("power-market-facilities");

      for (const f of data) {
        if (!f.lat || !f.lng) continue;

        const entity = ds.entities.add({
          position: Cesium.Cartesian3.fromDegrees(f.lng, f.lat, 800),
          point: new Cesium.PointGraphics({
            pixelSize: new Cesium.ConstantProperty(9),
            color: new Cesium.ConstantProperty(Cesium.Color.fromCssColorString("#c084fc").withAlpha(0.9)),
            outlineColor: new Cesium.ConstantProperty(Cesium.Color.fromCssColorString("#581c87").withAlpha(0.6)),
            outlineWidth: new Cesium.ConstantProperty(2),
            disableDepthTestDistance: new Cesium.ConstantProperty(Number.POSITIVE_INFINITY),
            scaleByDistance: new Cesium.ConstantProperty(new Cesium.NearFarScalar(100_000, 1.3, 5_000_000, 0.6)),
          }),
        });
        (entity as any).facilityMarketData = f;
      }

      this.ds = ds;
      this.loaded = true;
      ctx.viewer.dataSources.add(ds);
      this.stats = { enabled: true, entityCount: data.length, fetchStatus: "success", lastUpdateAt: Date.now(), lastError: null, note: `${data.length} facilities` };
      ctx.viewer.scene.requestRender();
    } catch (e: unknown) {
      this.stats = { ...this.stats, fetchStatus: "error", lastError: (e as Error).message };
    }
  }
}
