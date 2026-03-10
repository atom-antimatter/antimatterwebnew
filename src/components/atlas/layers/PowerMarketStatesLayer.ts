/**
 * PowerMarketStatesLayer — Renders state-level power market intelligence
 * as colored point markers at state centroids with score-based sizing.
 */
import * as Cesium from "cesium";
import type { ILayer, LayerContext, LayerStats } from "./types";
import { US_STATE_CENTROIDS } from "@/lib/power/usStateCentroids";

type StateData = {
  state: string;
  power_feasibility_score: number;
  industrial_rate_kwh: number;
  tier: string;
  dc_capacity_mw: number;
  composite_score: number;
};

function scoreToColor(score: number): Cesium.Color {
  if (score >= 80) return Cesium.Color.fromCssColorString("#34d399").withAlpha(0.85);
  if (score >= 60) return Cesium.Color.fromCssColorString("#60a5fa").withAlpha(0.80);
  if (score >= 40) return Cesium.Color.fromCssColorString("#fbbf24").withAlpha(0.75);
  return Cesium.Color.fromCssColorString("#f87171").withAlpha(0.70);
}

export class PowerMarketStatesLayer implements ILayer {
  readonly name = "powerMarketStates";
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
      const res = await fetch("/api/v1/states?limit=50&sort=composite");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { data } = await res.json() as { data: StateData[] };

      const ds = new Cesium.CustomDataSource("power-market-states");

      for (const s of data) {
        const centroid = US_STATE_CENTROIDS[s.state];
        if (!centroid) continue;

        const size = Math.max(8, Math.min(20, s.composite_score / 5));
        const color = scoreToColor(s.composite_score);

        const entity = ds.entities.add({
          position: Cesium.Cartesian3.fromDegrees(centroid.lng, centroid.lat, 500),
          point: new Cesium.PointGraphics({
            pixelSize: new Cesium.ConstantProperty(size),
            color: new Cesium.ConstantProperty(color),
            outlineColor: new Cesium.ConstantProperty(Cesium.Color.BLACK.withAlpha(0.4)),
            outlineWidth: new Cesium.ConstantProperty(1),
            disableDepthTestDistance: new Cesium.ConstantProperty(Number.POSITIVE_INFINITY),
            scaleByDistance: new Cesium.ConstantProperty(new Cesium.NearFarScalar(500_000, 1.2, 8_000_000, 0.6)),
          }),
          label: new Cesium.LabelGraphics({
            text: new Cesium.ConstantProperty(`${s.state}\n${s.composite_score}`),
            font: new Cesium.ConstantProperty("600 11px system-ui, sans-serif"),
            fillColor: new Cesium.ConstantProperty(Cesium.Color.fromCssColorString("#f0f0ff")),
            outlineColor: new Cesium.ConstantProperty(Cesium.Color.BLACK.withAlpha(0.8)),
            outlineWidth: new Cesium.ConstantProperty(3),
            style: new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE),
            pixelOffset: new Cesium.ConstantProperty(new Cesium.Cartesian2(0, -16)),
            horizontalOrigin: new Cesium.ConstantProperty(Cesium.HorizontalOrigin.CENTER),
            verticalOrigin: new Cesium.ConstantProperty(Cesium.VerticalOrigin.BOTTOM),
            disableDepthTestDistance: new Cesium.ConstantProperty(Number.POSITIVE_INFINITY),
            distanceDisplayCondition: new Cesium.ConstantProperty(new Cesium.DistanceDisplayCondition(0, 5_000_000)),
          }),
        });
        (entity as any).stateMarketData = s;
      }

      this.ds = ds;
      this.loaded = true;
      ctx.viewer.dataSources.add(ds);
      this.stats = { enabled: true, entityCount: data.length, fetchStatus: "success", lastUpdateAt: Date.now(), lastError: null, note: `${data.length} states` };
      ctx.viewer.scene.requestRender();
    } catch (e: unknown) {
      this.stats = { ...this.stats, fetchStatus: "error", lastError: (e as Error).message };
    }
  }
}
