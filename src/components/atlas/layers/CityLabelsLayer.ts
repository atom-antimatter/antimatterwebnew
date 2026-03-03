import * as Cesium from "cesium";
import type { ILayer, LayerContext, LayerStats } from "./types";

type CityPoint = { name: string; lat: number; lng: number; scalerank: number };

let _cities: CityPoint[] = [];
let _loading = false;
let _loaded  = false;

async function ensureCitiesLoaded(): Promise<CityPoint[]> {
  if (_loaded)  return _cities;
  if (_loading) {
    await new Promise<void>(resolve => {
      const id = setInterval(() => { if (_loaded) { clearInterval(id); resolve(); } }, 80);
    });
    return _cities;
  }
  _loading = true;
  try {
    const res = await fetch("/geo/populated_places.geojson");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const geo = await res.json();
    _cities = (geo.features ?? []).map((f: any) => {
      const p  = f.properties ?? {};
      const [lng, lat] = f.geometry?.coordinates ?? [0, 0];
      return {
        name:      String(p.NAME ?? p.name ?? ""),
        lat:       Number(lat),
        lng:       Number(lng),
        scalerank: Number(p.SCALERANK ?? p.scalerank ?? 9),
      };
    }).filter((c: CityPoint) => c.name && Number.isFinite(c.lat) && Number.isFinite(c.lng));
    _cities.sort((a, b) => a.scalerank - b.scalerank);
    _loaded  = true;
    console.log(`[CityLabelsLayer] loaded ${_cities.length} cities`);
  } catch (e) {
    console.error("[CityLabelsLayer] load failed:", e);
    _cities = [];
    _loaded = true;
  }
  _loading = false;
  return _cities;
}

function citiesForLevel(cities: CityPoint[], ctx: LayerContext): { list: CityPoint[]; gated: boolean } {
  if (ctx.cameraLevel === "WORLD") return { list: [], gated: true };

  const maxRank = ctx.cameraLevel === "REGION" ? 2
                : ctx.cameraLevel === "LOCAL"  ? 5
                : 9;

  const maxCount = ctx.cameraLevel === "REGION" ? 200
                 : ctx.cameraLevel === "LOCAL"  ? 1500
                 : 3000;

  let list = cities.filter(c => c.scalerank <= maxRank);

  if (ctx.viewRect && ctx.cameraLevel !== "REGION") {
    const buf = 2;
    const { west, east, south, north } = ctx.viewRect;
    list = list.filter(c =>
      c.lng >= west - buf && c.lng <= east + buf &&
      c.lat >= south - buf && c.lat <= north + buf
    );
  }
  return { list: list.slice(0, maxCount), gated: false };
}

export class CityLabelsLayer implements ILayer {
  readonly name = "cities";
  private ds:    Cesium.CustomDataSource | null = null;
  private stats: LayerStats = { enabled: false, entityCount: 0, fetchStatus: "idle", lastUpdateAt: null, lastError: null };

  async enable(ctx: LayerContext) {
    const { viewer } = ctx;
    if (!this.ds) {
      this.ds = new Cesium.CustomDataSource("city-labels");
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
    this.stats = { ...this.stats, fetchStatus: "loading" };
    const ds = this.ds;
    ds.entities.removeAll();

    const t0 = Date.now();
    let cities: CityPoint[];
    try {
      cities = await ensureCitiesLoaded();
    } catch (e: unknown) {
      this.stats = { ...this.stats, fetchStatus: "error", lastError: (e as Error).message };
      return;
    }

    const { list, gated } = citiesForLevel(cities, ctx);

    if (gated) {
      this.stats = { enabled: true, entityCount: 0, fetchStatus: "success", lastUpdateAt: Date.now(), lastError: null, note: "gated: zoom in past WORLD" };
      ctx.viewer.scene.requestRender();
      return;
    }

    const isDark = ctx.basemap === "osmDark";

    // High-contrast fill + strong halo outline = crisp on any background.
    // This is how professional map renderers produce legible labels.
    const fillColor = isDark
      ? Cesium.Color.fromCssColorString("#f0f0ff")
      : Cesium.Color.fromCssColorString("#0a0a1a");
    const outlineColor = isDark
      ? new Cesium.Color(0, 0, 0.05, 0.95)
      : new Cesium.Color(1, 1, 1, 0.95);

    for (const city of list) {
      const isCapital  = city.scalerank <= 1;
      const isMajor    = city.scalerank <= 3;
      const fontSize   = isCapital ? 15 : isMajor ? 13 : 11;
      const fontWeight = isCapital ? "700" : isMajor ? "600" : "500";
      const haloWidth  = isCapital ? 5 : isMajor ? 4 : 3;

      ds.entities.add({
        position: Cesium.Cartesian3.fromDegrees(city.lng, city.lat),
        label: new Cesium.LabelGraphics({
          text:             new Cesium.ConstantProperty(city.name),
          // System fonts render at native GPU resolution — no texture atlas softness.
          font:             new Cesium.ConstantProperty(
            `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Arial, sans-serif`
          ),
          fillColor:        new Cesium.ConstantProperty(fillColor),
          outlineColor:     new Cesium.ConstantProperty(outlineColor),
          // A thick halo outline is the standard technique for crisp legible
          // map labels — used by Mapbox, Google Maps, and every major renderer.
          outlineWidth:     new Cesium.ConstantProperty(haloWidth),
          style:            new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE),
          pixelOffset:      new Cesium.ConstantProperty(new Cesium.Cartesian2(0, -8)),
          horizontalOrigin: new Cesium.ConstantProperty(Cesium.HorizontalOrigin.CENTER),
          verticalOrigin:   new Cesium.ConstantProperty(Cesium.VerticalOrigin.BOTTOM),
          disableDepthTestDistance: new Cesium.ConstantProperty(Number.POSITIVE_INFINITY),
          // Gentle scale-down at distance; never show unreadably tiny text.
          scaleByDistance:  new Cesium.ConstantProperty(
            new Cesium.NearFarScalar(30_000, 1.0, 2_000_000, 0.75)
          ),
          // Show labels only within legible range — avoids the "pepper noise" of
          // tiny clustered text at high altitude.
          distanceDisplayCondition: new Cesium.ConstantProperty(
            isCapital ? new Cesium.DistanceDisplayCondition(0, 6_000_000)
            : isMajor ? new Cesium.DistanceDisplayCondition(0, 3_500_000)
            :           new Cesium.DistanceDisplayCondition(0, 1_500_000)
          ),
          scale: new Cesium.ConstantProperty(1.0),
        }),
        // Crisp dot marker for capital / major cities
        point: isMajor ? new Cesium.PointGraphics({
          pixelSize: new Cesium.ConstantProperty(isCapital ? 5 : 3),
          color:     new Cesium.ConstantProperty(
            isDark
              ? Cesium.Color.fromCssColorString("#a2a3e9").withAlpha(0.9)
              : Cesium.Color.fromCssColorString("#4c4dac").withAlpha(0.9)
          ),
          outlineColor: new Cesium.ConstantProperty(outlineColor),
          outlineWidth: new Cesium.ConstantProperty(1.5),
          disableDepthTestDistance: new Cesium.ConstantProperty(Number.POSITIVE_INFINITY),
        }) : undefined,
      });
    }

    this.stats = {
      enabled:      true,
      entityCount:  list.length,
      fetchStatus:  "success",
      lastUpdateAt: Date.now(),
      lastError:    null,
      note:         `${ctx.cameraLevel}, took ${Date.now()-t0}ms`,
    };
    ctx.viewer.scene.requestRender();
    console.log(`[CityLabelsLayer] rendered ${list.length} labels @ ${ctx.cameraLevel}`);
  }
}
