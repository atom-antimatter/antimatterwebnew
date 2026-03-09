/**
 * vectorBasemap.ts — Custom Cesium ImageryProvider that renders OpenFreeMap
 * vector tiles via a pool of offscreen MapLibre GL instances.
 *
 * Key design decisions:
 *  - Pool of N MapLibre maps (default 4) for parallel tile rendering
 *  - fitBounds() for pixel-perfect tile alignment with Cesium's grid
 *  - "idle" event for reliable tile-loaded detection
 *  - 5-second timeout per tile to prevent queue stalls
 *  - Transparent fallback canvas on error/timeout (Cesium will retry)
 */
import * as Cesium from "cesium";
import maplibregl from "maplibre-gl";

export type VectorStyleId = "vectorDark" | "vectorLight" | "vectorLiberty";

export const VECTOR_STYLE_URLS: Record<VectorStyleId, string> = {
  vectorDark:    "https://tiles.openfreemap.org/styles/dark",
  vectorLight:   "https://tiles.openfreemap.org/styles/positron",
  vectorLiberty: "https://tiles.openfreemap.org/styles/liberty",
};

const TILE_SIZE = 512;
const POOL_SIZE = 4;
const TILE_TIMEOUT_MS = 5000;

// ─── Map pool ─────────────────────────────────────────────────────────────

type PoolEntry = {
  map: maplibregl.Map;
  container: HTMLDivElement;
  busy: boolean;
};

async function createPoolEntry(styleUrl: string): Promise<PoolEntry> {
  const container = document.createElement("div");
  container.style.cssText = `width:${TILE_SIZE}px;height:${TILE_SIZE}px;position:fixed;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;`;
  document.body.appendChild(container);

  const map = new maplibregl.Map({
    container,
    style: styleUrl,
    center: [0, 0],
    zoom: 0,
    interactive: false,
    attributionControl: false,
    fadeDuration: 0,
    pixelRatio: 1,
  });

  await new Promise<void>((resolve, reject) => {
    map.once("load", () => resolve());
    map.once("error", (e) => reject(e.error ?? e));
  });

  return { map, container, busy: false };
}

// ─── Tile rendering ───────────────────────────────────────────────────────

/** Convert tile x/y/z to geographic bounds [west, south, east, north]. */
function tileToBounds(x: number, y: number, z: number): [number, number, number, number] {
  const n = Math.pow(2, z);
  const west = (x / n) * 360 - 180;
  const east = ((x + 1) / n) * 360 - 180;
  const north = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
  const south = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * 180) / Math.PI;
  return [west, south, east, north];
}

function renderTileOnMap(entry: PoolEntry, x: number, y: number, z: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const { map } = entry;
    const [west, south, east, north] = tileToBounds(x, y, z);

    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        // Return transparent canvas on timeout so Cesium can retry
        const blank = document.createElement("canvas");
        blank.width = TILE_SIZE;
        blank.height = TILE_SIZE;
        resolve(blank);
      }
    }, TILE_TIMEOUT_MS);

    // Fit the map exactly to the tile bounds
    map.fitBounds(
      [[west, south], [east, north]],
      { duration: 0, padding: 0, animate: false },
    );

    // Wait for MapLibre to finish loading and rendering all tiles
    const onIdle = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      try {
        const srcCanvas = map.getCanvas();
        const out = document.createElement("canvas");
        out.width = TILE_SIZE;
        out.height = TILE_SIZE;
        const ctx = out.getContext("2d");
        if (ctx) {
          ctx.drawImage(srcCanvas, 0, 0, TILE_SIZE, TILE_SIZE);
        }
        resolve(out);
      } catch (e) {
        reject(e);
      }
    };

    map.once("idle", onIdle);
  });
}

// ─── Cesium ImageryProvider ───────────────────────────────────────────────

class VectorTileImageryProvider {
  private _ready = false;
  private _readyPromise: Promise<boolean>;
  private _pool: PoolEntry[] = [];
  private _tileSize = TILE_SIZE;
  private _tilingScheme = new Cesium.WebMercatorTilingScheme();
  private _rectangle = this._tilingScheme.rectangle;
  private _credit = new Cesium.Credit("OpenFreeMap, OpenMapTiles, OpenStreetMap");
  private _errorEvent = new Cesium.Event();

  // Pending tasks waiting for a free pool entry
  private _waitQueue: Array<{
    x: number; y: number; z: number;
    resolve: (c: HTMLCanvasElement | HTMLImageElement) => void;
    reject: (e: unknown) => void;
  }> = [];

  constructor(styleUrl: string) {
    this._readyPromise = this._init(styleUrl);
  }

  private async _init(styleUrl: string): Promise<boolean> {
    const entries = await Promise.all(
      Array.from({ length: POOL_SIZE }, () => createPoolEntry(styleUrl)),
    );
    this._pool = entries;
    this._ready = true;
    return true;
  }

  // ─── Cesium interface ────────────────────────────────────────────────

  get ready() { return this._ready; }
  get readyPromise() { return this._readyPromise; }
  get rectangle() { return this._rectangle; }
  get tileWidth() { return this._tileSize; }
  get tileHeight() { return this._tileSize; }
  get maximumLevel() { return 20; }
  get minimumLevel() { return 0; }
  get tilingScheme() { return this._tilingScheme; }
  get hasAlphaChannel() { return true; }
  get errorEvent() { return this._errorEvent; }
  get credit() { return this._credit; }
  get proxy() { return undefined; }
  get tileDiscardPolicy() { return undefined; }

  getTileCredits(): Cesium.Credit[] { return []; }

  requestImage(
    x: number, y: number, level: number,
  ): Promise<HTMLCanvasElement | HTMLImageElement> | undefined {
    if (!this._ready || level > 20 || level < 0) return undefined;

    return new Promise((resolve, reject) => {
      // Try to grab a free pool entry immediately
      const free = this._pool.find(e => !e.busy);
      if (free) {
        this._renderWithEntry(free, x, y, level, resolve, reject);
      } else {
        // All busy — queue it
        this._waitQueue.push({ x, y, z: level, resolve, reject });
      }
    });
  }

  pickFeatures() { return undefined; }

  private async _renderWithEntry(
    entry: PoolEntry,
    x: number, y: number, z: number,
    resolve: (c: HTMLCanvasElement | HTMLImageElement) => void,
    reject: (e: unknown) => void,
  ) {
    entry.busy = true;
    try {
      const canvas = await renderTileOnMap(entry, x, y, z);
      resolve(canvas);
    } catch (e) {
      reject(e);
    } finally {
      entry.busy = false;
      // Process next queued task if any
      if (this._waitQueue.length > 0) {
        const next = this._waitQueue.shift()!;
        this._renderWithEntry(entry, next.x, next.y, next.z, next.resolve, next.reject);
      }
    }
  }

  destroy() {
    for (const entry of this._pool) {
      entry.map.remove();
      entry.container.remove();
    }
    this._pool = [];
    this._waitQueue = [];
  }
}

// ─── Public API ────────────────────────────────────────────────────────

let activeProvider: VectorTileImageryProvider | null = null;

export async function createVectorProvider(
  styleId: VectorStyleId,
): Promise<VectorTileImageryProvider> {
  if (activeProvider) {
    activeProvider.destroy();
    activeProvider = null;
  }

  const url = VECTOR_STYLE_URLS[styleId];
  const provider = new VectorTileImageryProvider(url);
  await provider.readyPromise;
  activeProvider = provider;
  return provider;
}
