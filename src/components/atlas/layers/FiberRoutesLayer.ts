import * as Cesium from "cesium";
import type { ILayer, LayerContext, LayerStats } from "./types";

// ─── Data cache ────────────────────────────────────────────────────────────

type Segment = { positions: Cesium.Cartesian3[]; color: string };
let _segments: Segment[] = [];
let _loaded   = false;
let _loading  = false;
let _loadError: string | null = null;

async function loadSegments(): Promise<{ segments: Segment[]; error: string | null }> {
  if (_loaded) return { segments: _segments, error: _loadError };
  if (_loading) {
    await new Promise<void>(r => { const id = setInterval(() => { if (_loaded) { clearInterval(id); r(); } }, 80); });
    return { segments: _segments, error: _loadError };
  }
  _loading = true;
  try {
    const res = await fetch("/geo/submarine-cables.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const geo  = await res.json();
    const segs: Segment[] = [];

    for (const feat of geo?.features ?? []) {
      const type  = feat.geometry?.type ?? "";
      const color = feat.properties?.color ?? "#696aac";
      const arrays: [number,number][][] =
        type === "LineString"      ? [feat.geometry.coordinates]
        : type === "MultiLineString" ? feat.geometry.coordinates
        : [];

      for (const line of arrays) {
        if (!Array.isArray(line) || line.length < 2) continue;
        const positions = line.map(([lon, lat]: [number, number]) =>
          Cesium.Cartesian3.fromDegrees(lon, lat, 5000));
        if (positions.length >= 2) segs.push({ positions, color });
      }
    }
    _segments = segs;
    _loadError = null;
    console.info(`[FiberRoutesLayer] loaded ${segs.length} segments`);
  } catch (e: unknown) {
    _loadError = (e as Error).message ?? String(e);
    _segments  = [];
    console.error("[FiberRoutesLayer] load failed:", _loadError);
  }
  _loaded  = true;
  _loading = false;
  return { segments: _segments, error: _loadError };
}

// ─── Layer ─────────────────────────────────────────────────────────────────

export class FiberRoutesLayer implements ILayer {
  readonly name = "routes";
  private ds:    Cesium.CustomDataSource | null = null;
  private stats: LayerStats = { enabled: false, entityCount: 0, fetchStatus: "idle", lastUpdateAt: null, lastError: null };
  private renderReqId = 0;

  async enable(ctx: LayerContext) {
    const { viewer } = ctx;
    if (!this.ds) {
      this.ds = new Cesium.CustomDataSource("fiber-routes");
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

  async update(ctx: LayerContext) {
    if (ctx.cameraLevel === "WORLD") {
      // Gated — clear entities
      if (this.ds) this.ds.entities.removeAll();
      this.stats = { ...this.stats, entityCount: 0, note: "gated: zoom in past WORLD" };
      ctx.viewer.scene.requestRender();
      return;
    }
    await this.render(ctx);
  }

  dispose(ctx: LayerContext) {
    if (this.ds) {
      if (ctx.viewer.dataSources.contains(this.ds)) ctx.viewer.dataSources.remove(this.ds, true);
      this.ds = null;
    }
  }

  getStats(): LayerStats { return this.stats; }

  private async render(ctx: LayerContext) {
    if (!this.ds) return;
    if (ctx.cameraLevel === "WORLD") {
      this.ds.entities.removeAll();
      this.stats = { ...this.stats, entityCount: 0, note: "gated: zoom in past WORLD" };
      ctx.viewer.scene.requestRender();
      return;
    }

    const myId = ++this.renderReqId;
    this.stats = { ...this.stats, fetchStatus: "loading" };
    const ds = this.ds;

    const { segments, error } = await loadSegments();

    // Stale render check — a newer render was triggered while we were loading
    if (myId !== this.renderReqId) return;
    ds.entities.removeAll();

    if (error) {
      this.stats = { ...this.stats, fetchStatus: "error", lastError: error };
      return;
    }

    // Viewport filter at LOCAL/CITY for performance
    let visible = segments;
    if (ctx.viewRect && (ctx.cameraLevel === "LOCAL" || ctx.cameraLevel === "CITY")) {
      const buf = 5;
      const { west, east, south, north } = ctx.viewRect;
      visible = segments.filter(seg =>
        seg.positions.some(pos => {
          const c = Cesium.Cartographic.fromCartesian(pos);
          const lon = Cesium.Math.toDegrees(c.longitude);
          const lat = Cesium.Math.toDegrees(c.latitude);
          return lon >= west - buf && lon <= east + buf && lat >= south - buf && lat <= north + buf;
        })
      );
    }

    // Cap for performance
    const MAX = 1200;
    if (visible.length > MAX) visible = visible.slice(0, MAX);

    for (const { positions, color } of visible) {
      const alpha = ctx.basemap === "osmDark" ? 0.55 : 0.45;
      ds.entities.add({
        polyline: new Cesium.PolylineGraphics({
          positions:     new Cesium.ConstantProperty(positions),
          width:         new Cesium.ConstantProperty(1.8),
          material:      new Cesium.ColorMaterialProperty(
            Cesium.Color.fromCssColorString(color).withAlpha(alpha)
          ),
          clampToGround: new Cesium.ConstantProperty(false),
          arcType:       new Cesium.ConstantProperty(Cesium.ArcType.GEODESIC),
        }),
      });
    }

    this.stats = {
      enabled:      true,
      entityCount:  visible.length,
      fetchStatus:  "success",
      lastUpdateAt: Date.now(),
      lastError:    null,
      note:         `${visible.length}/${segments.length} segs @ ${ctx.cameraLevel}`,
    };
    ctx.viewer.scene.requestRender();
    console.log(`[FiberRoutesLayer] rendered ${visible.length} segments @ ${ctx.cameraLevel}`);
  }
}
