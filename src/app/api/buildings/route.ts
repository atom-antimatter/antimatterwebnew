/**
 * GET /api/buildings?bbox=-84.4,33.7,-84.3,33.8&zoom=15
 *
 * Fetches building footprints for the viewport from the Microsoft Global
 * Building Footprints dataset. Uses a quadkey-based caching layer in Supabase
 * to avoid re-fetching the same data.
 *
 * Flow:
 *   1. Convert bbox → quadkeys at zoom 9 (MS dataset partition level)
 *   2. Check Supabase cache for each quadkey
 *   3. For cache misses, fetch the compressed GeoJSON from Azure
 *   4. Filter to viewport bbox, cache the result
 *   5. Return merged GeoJSON with height data
 */
import { NextResponse } from "next/server";
import { gunzipSync } from "zlib";
import { bboxToQuadKeys, MS_BUILDING_QUADKEY_ZOOM } from "@/lib/map/quadkeys";

export const dynamic = "force-dynamic";

const MANIFEST_URL = "https://minedbuildings.z5.web.core.windows.net/global-buildings/dataset-links.csv";
const MAX_BUILDINGS = 2000;
const CACHE_TTL_HOURS = 168; // 7 days

let manifestCache: Map<string, string> | null = null;
let manifestLoadedAt = 0;

type BuildingFeature = {
  type: "Feature";
  geometry: { type: string; coordinates: number[][][] };
  properties: { height?: number; confidence?: number };
};

async function loadManifest(): Promise<Map<string, string>> {
  if (manifestCache && Date.now() - manifestLoadedAt < 24 * 60 * 60 * 1000) {
    return manifestCache;
  }
  const res = await fetch(MANIFEST_URL);
  if (!res.ok) throw new Error(`Manifest fetch failed: HTTP ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split("\n").slice(1);
  const map = new Map<string, string>();
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length >= 2) {
      const quadkey = parts[1]?.trim();
      const url = parts[parts.length - 1]?.trim();
      if (quadkey && url) map.set(quadkey, url);
    }
  }
  manifestCache = map;
  manifestLoadedAt = Date.now();
  console.log(`[buildings] Manifest loaded: ${map.size} quadkeys`);
  return map;
}

function getCentroid(coords: number[][]): [number, number] {
  let sumLon = 0, sumLat = 0;
  for (const [lon, lat] of coords) { sumLon += lon; sumLat += lat; }
  return [sumLon / coords.length, sumLat / coords.length];
}

function isInBbox(coords: number[][], west: number, south: number, east: number, north: number): boolean {
  const [lon, lat] = getCentroid(coords);
  return lon >= west && lon <= east && lat >= south && lat <= north;
}

async function fetchAndParseQuadkey(url: string, bbox: { west: number; south: number; east: number; north: number }): Promise<BuildingFeature[]> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  let text: string;
  try {
    const decompressed = gunzipSync(buffer);
    text = decompressed.toString("utf-8");
  } catch {
    text = buffer.toString("utf-8");
  }

  const features: BuildingFeature[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const feature = JSON.parse(line);
      if (feature.geometry?.type !== "Polygon" && feature.geometry?.type !== "MultiPolygon") continue;
      const ring = feature.geometry.type === "Polygon"
        ? feature.geometry.coordinates[0]
        : feature.geometry.coordinates[0]?.[0];
      if (!ring || ring.length < 4) continue;
      if (!isInBbox(ring, bbox.west, bbox.south, bbox.east, bbox.north)) continue;

      const height = feature.properties?.height ?? 10;
      features.push({
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [ring] },
        properties: { height, confidence: feature.properties?.confidence },
      });
    } catch { /* skip malformed */ }
  }
  return features;
}

async function getCachedTile(supabaseUrl: string, serviceKey: string, quadkey: string): Promise<BuildingFeature[] | null> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/building_tiles?quadkey=eq.${quadkey}&select=geojson,last_updated`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows?.[0]) return null;
    const age = (Date.now() - new Date(rows[0].last_updated).getTime()) / (1000 * 60 * 60);
    if (age > CACHE_TTL_HOURS) return null;
    const geojson = rows[0].geojson;
    return geojson?.features ?? null;
  } catch {
    return null;
  }
}

async function setCachedTile(
  supabaseUrl: string, serviceKey: string,
  quadkey: string, features: BuildingFeature[],
  bbox: { west: number; south: number; east: number; north: number }
) {
  try {
    const body = {
      quadkey,
      geojson: { type: "FeatureCollection", features },
      bbox_west: bbox.west, bbox_south: bbox.south, bbox_east: bbox.east, bbox_north: bbox.north,
      building_count: features.length,
      byte_size: JSON.stringify(features).length,
      last_updated: new Date().toISOString(),
    };
    await fetch(`${supabaseUrl}/rest/v1/building_tiles`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.warn("[buildings] Cache write failed:", e);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bboxStr = searchParams.get("bbox");

  if (!bboxStr) {
    return NextResponse.json({ error: "Missing bbox parameter (west,south,east,north)" }, { status: 400 });
  }

  const [west, south, east, north] = bboxStr.split(",").map(Number);
  if ([west, south, east, north].some(v => !Number.isFinite(v))) {
    return NextResponse.json({ error: "Invalid bbox values" }, { status: 400 });
  }

  // Fast path: countOnly returns estimated building count without fetching full GeoJSON.
  // Used by use3DAvailability to check density before entering 3D mode.
  const countOnly = searchParams.get("countOnly") === "true";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const quadkeys = bboxToQuadKeys(west, south, east, north, MS_BUILDING_QUADKEY_ZOOM);

    if (countOnly) {
      // Quick density check: just see which quadkeys have data in the manifest
      const manifest = await loadManifest();
      let estimatedCount = 0;
      for (const qk of quadkeys) {
        if (manifest.has(qk)) estimatedCount += 500; // avg buildings per quadkey tile
        if (supabaseUrl && serviceKey) {
          const cached = await getCachedTile(supabaseUrl, serviceKey, qk);
          if (cached) { estimatedCount = estimatedCount - 500 + cached.length; }
        }
      }
      return NextResponse.json(
        { count: estimatedCount, quadkeys: quadkeys.length },
        { headers: { "Cache-Control": "public, max-age=60" } },
      );
    }

    console.log(`[buildings] bbox ${bboxStr} → ${quadkeys.length} quadkeys: ${quadkeys.slice(0, 5).join(",")}`);

    const manifest = await loadManifest();
    const allFeatures: BuildingFeature[] = [];
    const stats = { cached: 0, fetched: 0, missed: 0 };

    for (const qk of quadkeys) {
      if (allFeatures.length >= MAX_BUILDINGS) break;

      if (supabaseUrl && serviceKey) {
        const cached = await getCachedTile(supabaseUrl, serviceKey, qk);
        if (cached) {
          const filtered = cached.filter(f => {
            const ring = f.geometry.coordinates[0];
            return ring && isInBbox(ring, west, south, east, north);
          });
          allFeatures.push(...filtered);
          stats.cached++;
          continue;
        }
      }

      const url = manifest.get(qk);
      if (!url) { stats.missed++; continue; }

      try {
        const features = await fetchAndParseQuadkey(url, { west, south, east, north });
        allFeatures.push(...features);
        stats.fetched++;

        if (supabaseUrl && serviceKey) {
          setCachedTile(supabaseUrl, serviceKey, qk, features, { west, south, east, north });
        }
      } catch (e) {
        console.warn(`[buildings] Failed to fetch quadkey ${qk}:`, (e as Error).message);
        stats.missed++;
      }
    }

    const limited = allFeatures.slice(0, MAX_BUILDINGS);

    return NextResponse.json({
      type: "FeatureCollection",
      features: limited,
      _meta: {
        quadkeys: quadkeys.length,
        ...stats,
        total: limited.length,
        truncated: allFeatures.length > MAX_BUILDINGS,
      },
    }, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch (err) {
    console.error("[buildings]", err);
    return NextResponse.json({
      type: "FeatureCollection",
      features: [],
      error: (err as Error).message,
    }, { status: 200 });
  }
}
