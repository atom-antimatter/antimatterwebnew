import * as Cesium from "cesium";
import type { ILayer, LayerContext, LayerStats } from "./types";

// ─── Data cache ────────────────────────────────────────────────────────────

type RawSegment = { coords: [number, number][]; color: string };
let _segments: RawSegment[] = [];
let _loaded   = false;
let _loading  = false;
let _loadError: string | null = null;

async function loadSegments(): Promise<{ segments: RawSegment[]; error: string | null }> {
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
    const segs: RawSegment[] = [];

    for (const feat of geo?.features ?? []) {
      const type  = feat.geometry?.type ?? "";
      const color = feat.properties?.color ?? "#696aac";
      const arrays: [number, number][][] =
        type === "LineString"      ? [feat.geometry.coordinates]
        : type === "MultiLineString" ? feat.geometry.coordinates
        : [];

      for (const line of arrays) {
        if (!Array.isArray(line) || line.length < 2) continue;
        segs.push({ coords: line, color });
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

// Slight elevation above terrain to prevent depth fighting
const ROUTE_HEIGHT = 200;
const MAX_SEGMENTS = 1200;

// ─── Layer ─────────────────────────────────────────────────────────────────

export class FiberRoutesLayer implements ILayer {
  readonly name = "routes";
  private primitive: Cesium.PrimitiveCollection | null = null;
  private stats: LayerStats = { enabled: false, entityCount: 0, fetchStatus: "idle", lastUpdateAt: null, lastError: null };
  private renderReqId = 0;
  private lastRenderKey = "";

  async enable(ctx: LayerContext) {
    await this.render(ctx);
  }

  disable(ctx: LayerContext) {
    this.removePrimitives(ctx);
    this.lastRenderKey = "";
  }

  async update(ctx: LayerContext) {
    if (ctx.cameraLevel === "WORLD") {
      this.removePrimitives(ctx);
      this.stats = { ...this.stats, entityCount: 0, note: "gated: zoom in past WORLD" };
      ctx.viewer.scene.requestRender();
      return;
    }
    await this.render(ctx);
  }

  dispose(ctx: LayerContext) {
    this.removePrimitives(ctx);
  }

  getStats(): LayerStats { return this.stats; }

  private removePrimitives(ctx: LayerContext) {
    if (this.primitive && ctx.viewer.scene.primitives.contains(this.primitive)) {
      ctx.viewer.scene.primitives.remove(this.primitive);
    }
    this.primitive = null;
    ctx.viewer.scene.requestRender();
  }

  private async render(ctx: LayerContext) {
    if (ctx.cameraLevel === "WORLD") {
      this.removePrimitives(ctx);
      this.stats = { ...this.stats, entityCount: 0, note: "gated: zoom in past WORLD" };
      ctx.viewer.scene.requestRender();
      return;
    }

    // Dedupe renders for the same viewport
    const renderKey = `${ctx.cameraLevel}-${ctx.viewRect?.west?.toFixed(1)}-${ctx.viewRect?.south?.toFixed(1)}`;
    if (renderKey === this.lastRenderKey && this.stats.entityCount > 0) return;

    const myId = ++this.renderReqId;
    this.stats = { ...this.stats, fetchStatus: "loading" };

    const { segments, error } = await loadSegments();
    if (myId !== this.renderReqId) return;

    if (error) {
      this.stats = { ...this.stats, fetchStatus: "error", lastError: error };
      return;
    }

    // Viewport filter for performance
    let visible = segments;
    if (ctx.viewRect && (ctx.cameraLevel === "LOCAL" || ctx.cameraLevel === "CITY")) {
      const buf = 5;
      const { west, east, south, north } = ctx.viewRect;
      visible = segments.filter(seg =>
        seg.coords.some(([lon, lat]) =>
          lon >= west - buf && lon <= east + buf &&
          lat >= south - buf && lat <= north + buf
        )
      );
    }
    if (visible.length > MAX_SEGMENTS) visible = visible.slice(0, MAX_SEGMENTS);

    this.removePrimitives(ctx);

    const collection = new Cesium.PrimitiveCollection();
    const isDark = ctx.basemap === "osmDark" || ctx.basemap === "vectorDark";
    const alpha = isDark ? 0.6 : 0.5;
    let count = 0;

    for (const { coords, color } of visible) {
      if (coords.length < 2) continue;

      // Build positions with height to avoid depth fighting
      const flat: number[] = [];
      for (const [lon, lat] of coords) {
        flat.push(lon, lat, ROUTE_HEIGHT);
      }
      const positions = Cesium.Cartesian3.fromDegreesArrayHeights(flat);
      if (positions.length < 2) continue;

      try {
        const geometry = new Cesium.PolylineGeometry({
          positions,
          width: 3.0,
          arcType: Cesium.ArcType.NONE,
          vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
          colors: Array(positions.length).fill(
            Cesium.Color.fromCssColorString(color).withAlpha(alpha)
          ),
          colorsPerVertex: true,
        });

        collection.add(new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({ geometry }),
          appearance: new Cesium.PolylineColorAppearance(),
          asynchronous: false,
          allowPicking: false,
        }));
        count++;
      } catch {
        // Skip malformed segments
      }
    }

    if (count > 0) {
      ctx.viewer.scene.primitives.add(collection);
      this.primitive = collection;
    }

    this.lastRenderKey = renderKey;
    this.stats = {
      enabled:      true,
      entityCount:  count,
      fetchStatus:  "success",
      lastUpdateAt: Date.now(),
      lastError:    null,
      note:         `${count}/${segments.length} segs @ ${ctx.cameraLevel} (GPU primitives)`,
    };
    ctx.viewer.scene.requestRender();
    console.log(`[FiberRoutesLayer] rendered ${count} segments as GPU primitives @ ${ctx.cameraLevel}`);
  }
}
