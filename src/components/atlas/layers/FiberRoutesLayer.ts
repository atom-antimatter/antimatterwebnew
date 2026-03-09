import * as Cesium from "cesium";
import type { ILayer, LayerContext, LayerStats } from "./types";

// ─── Data cache ────────────────────────────────────────────────────────────

type RawSegment = { coords: [number, number][]; color: string; name: string; id: string };
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
        segs.push({
          coords: line,
          color,
          name: String(feat.properties?.name ?? "Unknown cable"),
          id: String(feat.properties?.id ?? ""),
        });
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

const ROUTE_HEIGHT = 200;
const MAX_SEGMENTS = 2000;

// ─── Layer ─────────────────────────────────────────────────────────────────

export class FiberRoutesLayer implements ILayer {
  readonly name = "routes";
  private primitive: Cesium.PrimitiveCollection | null = null;
  private stats: LayerStats = { enabled: false, entityCount: 0, fetchStatus: "idle", lastUpdateAt: null, lastError: null };
  private rendered = false;

  async enable(ctx: LayerContext) {
    if (!this.rendered) await this.render(ctx);
  }

  disable(ctx: LayerContext) {
    this.removePrimitives(ctx);
    this.rendered = false;
  }

  async update(_ctx: LayerContext) {
    // Fiber routes are global and don't change with camera position.
    // Once rendered, keep them stable until disabled.
  }

  dispose(ctx: LayerContext) {
    this.removePrimitives(ctx);
    this.rendered = false;
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
    this.stats = { ...this.stats, fetchStatus: "loading" };

    const { segments, error } = await loadSegments();

    if (error) {
      this.stats = { ...this.stats, fetchStatus: "error", lastError: error };
      return;
    }

    // Remove old primitives before adding new ones
    this.removePrimitives(ctx);

    const visible = segments.slice(0, MAX_SEGMENTS);
    const collection = new Cesium.PrimitiveCollection();
    const isDark = ctx.basemap === "osmDark";
    const alpha = isDark ? 0.5 : 0.4;
    let count = 0;

    for (const { coords, color } of visible) {
      if (coords.length < 2) continue;

      const flat: number[] = [];
      for (const [lon, lat] of coords) {
        flat.push(lon, lat, ROUTE_HEIGHT);
      }
      const positions = Cesium.Cartesian3.fromDegreesArrayHeights(flat);
      if (positions.length < 2) continue;

      try {
        const geometry = new Cesium.PolylineGeometry({
          positions,
          width: 2.0,
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

    this.rendered = true;
    this.stats = {
      enabled:      true,
      entityCount:  count,
      fetchStatus:  "success",
      lastUpdateAt: Date.now(),
      lastError:    null,
      note:         `${count}/${segments.length} segments (persistent)`,
    };
    ctx.viewer.scene.requestRender();
    console.log(`[FiberRoutesLayer] rendered ${count} persistent segments`);
  }
}

/** Unique cable names + colors for legend rendering. Available after first load. */
export function getFiberCableList(): Array<{ name: string; color: string; id: string }> {
  const seen = new Map<string, { name: string; color: string; id: string }>();
  for (const seg of _segments) {
    if (!seen.has(seg.id)) {
      seen.set(seg.id, { name: seg.name, color: seg.color, id: seg.id });
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}
