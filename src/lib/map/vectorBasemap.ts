/**
 * vectorBasemap.ts — OpenFreeMap vector tile provider for Cesium.
 *
 * Uses @macrostrat/cesium-vector-provider to render MapLibre GL vector tiles
 * into an offscreen canvas, exposed as a Cesium ImageryProvider.
 *
 * Vector tiles give us:
 *  - SDF text rendering (crisp labels at any DPI)
 *  - Client-side styling (no pre-baked raster quality ceiling)
 *  - Retina-native rendering (no @2x hacks)
 *
 * Tile source: OpenFreeMap (free, no API key, MIT license, OpenMapTiles schema)
 */
import MapboxVectorProvider from "@macrostrat/cesium-vector-provider";

export type VectorStyleId = "vectorDark" | "vectorLight" | "vectorLiberty";

export const VECTOR_STYLE_URLS: Record<VectorStyleId, string> = {
  vectorDark:    "https://tiles.openfreemap.org/styles/dark",
  vectorLight:   "https://tiles.openfreemap.org/styles/positron",
  vectorLiberty: "https://tiles.openfreemap.org/styles/liberty",
};

const styleCache = new Map<string, object>();

async function fetchStyle(url: string): Promise<object> {
  const cached = styleCache.get(url);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch style: ${res.status}`);
  const json = await res.json();
  styleCache.set(url, json);
  return json;
}

/**
 * Create a Cesium-compatible ImageryProvider backed by MapLibre vector rendering.
 *
 * IMPORTANT: The style must be fetched first (async) before constructing the
 * provider. Call `createVectorProvider()` which handles this.
 */
export async function createVectorProvider(
  styleId: VectorStyleId,
  opts?: { tileSize?: number; maximumLevel?: number },
): Promise<InstanceType<typeof MapboxVectorProvider>> {
  const styleUrl = VECTOR_STYLE_URLS[styleId];
  const style = await fetchStyle(styleUrl);

  const provider = new MapboxVectorProvider({
    style,
    tileSize: opts?.tileSize ?? 512,
    maximumLevel: opts?.maximumLevel ?? 20,
    minimumLevel: 0,
    hasAlphaChannel: true,
    credit: "OpenFreeMap, OpenMapTiles, OpenStreetMap",
  });

  return provider;
}
