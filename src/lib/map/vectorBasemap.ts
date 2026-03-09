/**
 * vectorBasemap.ts — Custom Cesium ImageryProvider that renders OpenFreeMap
 * vector tiles via MapLibre GL on an offscreen canvas.
 *
 * This replaces the broken @macrostrat/cesium-vector-provider (which imports
 * Node's `assert` module and fails in Next.js client bundles).
 *
 * Architecture:
 *  1. Create a hidden MapLibre Map instance (256x256 or 512x512)
 *  2. For each tile request from Cesium, set the MapLibre camera to that tile
 *  3. Render to the offscreen canvas
 *  4. Return the canvas as the tile image
 *
 * This gives us crisp SDF-rendered labels, sharp borders, and retina-native
 * rendering — all from free OpenFreeMap vector tiles.
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

/**
 * A Cesium-compatible ImageryProvider that renders vector tiles via MapLibre GL.
 */
class VectorTileImageryProvider {
  private _ready = false;
  private _readyPromise: Promise<boolean>;
  private _map: maplibregl.Map | null = null;
  private _container: HTMLDivElement | null = null;
  private _tileSize: number;
  private _tilingScheme: Cesium.WebMercatorTilingScheme;
  private _rectangle: Cesium.Rectangle;
  private _credit: Cesium.Credit;
  private _errorEvent = new Cesium.Event();
  private _maximumLevel = 20;
  private _minimumLevel = 0;
  private _renderQueue: Array<{
    x: number; y: number; z: number;
    resolve: (img: HTMLCanvasElement | HTMLImageElement) => void;
    reject: (e: unknown) => void;
  }> = [];
  private _rendering = false;

  constructor(styleUrl: string, tileSize = TILE_SIZE) {
    this._tileSize = tileSize;
    this._tilingScheme = new Cesium.WebMercatorTilingScheme();
    this._rectangle = this._tilingScheme.rectangle;
    this._credit = new Cesium.Credit("OpenFreeMap, OpenMapTiles, OpenStreetMap");

    this._readyPromise = this._initMap(styleUrl);
  }

  private async _initMap(styleUrl: string): Promise<boolean> {
    // Create an offscreen container
    const container = document.createElement("div");
    container.style.width = `${this._tileSize}px`;
    container.style.height = `${this._tileSize}px`;
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.visibility = "hidden";
    document.body.appendChild(container);
    this._container = container;

    const map = new maplibregl.Map({
      container,
      style: styleUrl,
      center: [0, 0],
      zoom: 0,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
      pixelRatio: 1, // we handle DPI at the Cesium level
    });

    await new Promise<void>((resolve, reject) => {
      map.on("load", () => resolve());
      map.on("error", (e) => {
        console.error("[VectorBasemap] MapLibre error:", e);
        reject(e);
      });
    });

    this._map = map;
    this._ready = true;
    return true;
  }

  // ─── Cesium ImageryProvider interface ─────────────────────────────────

  get ready() { return this._ready; }
  get readyPromise() { return this._readyPromise; }
  get rectangle() { return this._rectangle; }
  get tileWidth() { return this._tileSize; }
  get tileHeight() { return this._tileSize; }
  get maximumLevel() { return this._maximumLevel; }
  get minimumLevel() { return this._minimumLevel; }
  get tilingScheme() { return this._tilingScheme; }
  get hasAlphaChannel() { return true; }
  get errorEvent() { return this._errorEvent; }
  get credit() { return this._credit; }
  get proxy() { return undefined; }
  get tileDiscardPolicy() { return undefined; }

  getTileCredits(_x: number, _y: number, _level: number): Cesium.Credit[] {
    return [];
  }

  requestImage(
    x: number,
    y: number,
    level: number,
    _request?: Cesium.Request,
  ): Promise<HTMLCanvasElement | HTMLImageElement> | undefined {
    if (!this._map || level > this._maximumLevel || level < this._minimumLevel) {
      return undefined;
    }

    return new Promise((resolve, reject) => {
      this._renderQueue.push({ x, y, z: level, resolve, reject });
      this._processQueue();
    });
  }

  pickFeatures() { return undefined; }

  destroy() {
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
    if (this._container) {
      this._container.remove();
      this._container = null;
    }
  }

  // ─── Tile rendering ──────────────────────────────────────────────────

  private async _processQueue() {
    if (this._rendering || this._renderQueue.length === 0 || !this._map) return;
    this._rendering = true;

    while (this._renderQueue.length > 0) {
      const task = this._renderQueue.shift()!;
      try {
        const canvas = await this._renderTile(task.x, task.y, task.z);
        task.resolve(canvas);
      } catch (e) {
        task.reject(e);
      }
    }

    this._rendering = false;
  }

  private _renderTile(x: number, y: number, z: number): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const map = this._map;
      if (!map) { reject(new Error("Map not ready")); return; }

      // Convert tile x,y,z to lon/lat center
      const n = Math.pow(2, z);
      const lonLeft = (x / n) * 360 - 180;
      const lonRight = ((x + 1) / n) * 360 - 180;
      const latTopRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
      const latBotRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n)));
      const latTop = (latTopRad * 180) / Math.PI;
      const latBot = (latBotRad * 180) / Math.PI;

      const centerLon = (lonLeft + lonRight) / 2;
      const centerLat = (latTop + latBot) / 2;

      map.jumpTo({ center: [centerLon, centerLat], zoom: z });
      map.resize();

      // Wait for tiles to load, then grab the canvas
      const tryRender = () => {
        if (map.isStyleLoaded() && map.areTilesLoaded()) {
          map.triggerRepaint();
          // Use requestAnimationFrame to ensure the frame is actually painted
          requestAnimationFrame(() => {
            try {
              const srcCanvas = map.getCanvas();
              const outCanvas = document.createElement("canvas");
              outCanvas.width = this._tileSize;
              outCanvas.height = this._tileSize;
              const ctx = outCanvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(srcCanvas, 0, 0, this._tileSize, this._tileSize);
              }
              resolve(outCanvas);
            } catch (e) {
              reject(e);
            }
          });
        } else {
          // Tiles not ready yet, wait a bit
          setTimeout(tryRender, 16);
        }
      };

      // Small delay to let MapLibre start loading tiles for the new viewport
      setTimeout(tryRender, 32);
    });
  }
}

// ─── Public API ────────────────────────────────────────────────────────

let activeProvider: VectorTileImageryProvider | null = null;

/**
 * Create a Cesium-compatible ImageryProvider backed by MapLibre vector rendering.
 * Returns a provider that implements the Cesium ImageryProvider interface.
 */
export async function createVectorProvider(
  styleId: VectorStyleId,
): Promise<VectorTileImageryProvider> {
  // Destroy previous provider to free the offscreen map
  if (activeProvider) {
    activeProvider.destroy();
    activeProvider = null;
  }

  const url = VECTOR_STYLE_URLS[styleId];
  const provider = new VectorTileImageryProvider(url, TILE_SIZE);
  await provider.readyPromise;
  activeProvider = provider;
  return provider;
}
