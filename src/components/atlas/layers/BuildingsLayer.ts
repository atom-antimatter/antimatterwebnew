/**
 * BuildingsLayer — open-source 3D building extrusions with GPU batching.
 *
 * Fetches building footprints from /api/buildings (Microsoft Global Building
 * Footprints, cached in Supabase). Renders as batched Cesium Primitive with
 * GeometryInstance for 10k+ buildings. Skyline shading (height-based color),
 * LOD by camera height, max 5000 per frame. Compatible with terrain and shadows.
 */
import * as Cesium from "cesium";
import type { ILayer, LayerContext, LayerStats } from "./types";

type BuildingFeature = {
  type: "Feature";
  geometry: { type: string; coordinates: number[][][] };
  properties: { height?: number; confidence?: number };
};

const MAX_BUILDINGS_RENDER = 5000;
const CAMERA_HEIGHT_BUILDINGS_OFF = 15_000; // no buildings above 15km
const CAMERA_HEIGHT_SIMPLIFIED = 5_000;    // 5–15km: simplified (max 1000)
const CAMERA_HEIGHT_FULL = 2_000;           // 2–5km: full; <2km: full

/** Skyline shading: short → darker, tall → lighter (improves silhouette readability). */
function colorForHeight(h: number, isDark: boolean): Cesium.Color {
  if (isDark) {
    if (h > 80) return Cesium.Color.fromCssColorString("rgba(200,200,225,0.90)");
    if (h > 20) return Cesium.Color.fromCssColorString("rgba(170,170,195,0.84)");
    return Cesium.Color.fromCssColorString("rgba(145,145,170,0.78)");
  }
  if (h > 80) return Cesium.Color.fromCssColorString("rgba(185,185,200,0.88)");
  if (h > 20) return Cesium.Color.fromCssColorString("rgba(158,158,175,0.80)");
  return Cesium.Color.fromCssColorString("rgba(138,138,155,0.74)");
}

export class BuildingsLayer implements ILayer {
  readonly name = "buildings";
  private primitive: Cesium.Primitive | null = null;
  private stats: LayerStats = { enabled: false, entityCount: 0, fetchStatus: "idle", lastUpdateAt: null, lastError: null };
  private renderReqId = 0;
  private lastFetchKey = "";

  async enable(ctx: LayerContext) {
    await this.render(ctx);
  }

  disable(ctx: LayerContext) {
    this.removePrimitive(ctx);
    this.lastFetchKey = "";
  }

  async update(ctx: LayerContext) {
    await this.render(ctx);
  }

  dispose(ctx: LayerContext) {
    this.removePrimitive(ctx);
  }

  getStats(): LayerStats {
    return this.stats;
  }

  private removePrimitive(ctx: LayerContext) {
    if (this.primitive && ctx.viewer.scene.primitives.contains(this.primitive)) {
      ctx.viewer.scene.primitives.remove(this.primitive);
      if (typeof this.primitive.destroy === "function") this.primitive.destroy();
      this.primitive = null;
    }
    ctx.viewer.scene.requestRender();
  }

  private async render(ctx: LayerContext) {
    const heightMeters = ctx.heightMeters ?? 0;

    if (heightMeters > CAMERA_HEIGHT_BUILDINGS_OFF) {
      this.removePrimitive(ctx);
      this.stats = { ...this.stats, entityCount: 0, note: "gated: zoom to city level (<15 km) to see buildings" };
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
      const res = await fetch(`/api/buildings?bbox=${bbox}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (myId !== this.renderReqId) return;

      const features: BuildingFeature[] = data.features ?? [];
      const isDark = ctx.basemap === "osmDark";

      // LOD: limit count by camera height
      let maxCount = MAX_BUILDINGS_RENDER;
      if (heightMeters > CAMERA_HEIGHT_SIMPLIFIED) maxCount = 1000;
      else if (heightMeters > CAMERA_HEIGHT_FULL) maxCount = 5000;
      const toRender = features.slice(0, maxCount);

      this.removePrimitive(ctx);

      const instances: Cesium.GeometryInstance[] = [];
      const vertexFormat = Cesium.PerInstanceColorAppearance.VERTEX_FORMAT;

      for (const f of toRender) {
        try {
          const ring = f.geometry?.coordinates?.[0];
          if (!ring || ring.length < 4) continue;

          const flat: number[] = [];
          for (const [lon, lat] of ring) flat.push(lon, lat);
          const positions = Cesium.Cartesian3.fromDegreesArray(flat);
          const hierarchy = new Cesium.PolygonHierarchy(positions);

          const height = Math.max(1, f.properties?.height ?? 10);
          const polygonDesc = new Cesium.PolygonGeometry({
            polygonHierarchy: hierarchy,
            height: 0,
            extrudedHeight: height,
            vertexFormat,
          });
          const geometry = Cesium.PolygonGeometry.createGeometry(polygonDesc);
          if (!geometry) continue;

          const color = colorForHeight(height, isDark);
          instances.push(
            new Cesium.GeometryInstance({
              geometry,
              modelMatrix: Cesium.Matrix4.IDENTITY,
              attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
              },
            })
          );
        } catch {
          /* skip malformed */
        }
      }

      if (instances.length > 0) {
        this.primitive = new Cesium.Primitive({
          geometryInstances: instances,
          appearance: new Cesium.PerInstanceColorAppearance({
            flat: false,
            translucent: false,
            closed: true,
          }),
          asynchronous: false,
          releaseGeometryInstances: true,
        });
        ctx.viewer.scene.primitives.add(this.primitive);
      }

      this.lastFetchKey = fetchKey;
      const meta = data._meta ?? {};
      this.stats = {
        enabled: true,
        entityCount: instances.length,
        fetchStatus: "success",
        lastUpdateAt: Date.now(),
        lastError: null,
        note: `${instances.length} buildings (${meta.cached ?? 0} cached, ${meta.fetched ?? 0} fetched)`,
      };
      ctx.viewer.scene.requestRender();
    } catch (e: unknown) {
      if (myId !== this.renderReqId) return;
      const msg = (e as Error).message ?? String(e);
      this.stats = { ...this.stats, fetchStatus: "error", lastError: msg };
      this.removePrimitive(ctx);
      console.error("[BuildingsLayer]", msg);
    }
  }
}
