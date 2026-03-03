/**
 * GET /api/osm?west=&south=&east=&north=
 *
 * Queries the OpenStreetMap Overpass API for data-center-tagged features
 * within a bounding box and returns them as a simplified GeoJSON FeatureCollection.
 *
 * Caching: results are stored in an in-process Map keyed by a tile-rounded bbox
 * (0.5-degree grid) so repeated pan/zoom doesn't re-hit Overpass.
 *
 * Rate limiting: enforces a minimum 2-second gap between Overpass requests.
 * Overpass usage policy: https://wiki.openstreetmap.org/wiki/Overpass_API#Usage_Policy
 */
import { NextResponse } from "next/server";

// ── Types ──────────────────────────────────────────────────────────────────

type OverpassNode = {
  type: "node";
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
};

type OverpassWay = {
  type: "way";
  id: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassRelation = {
  type: "relation";
  id: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassElement = OverpassNode | OverpassWay | OverpassRelation;

// ── In-process cache ────────────────────────────────────────────────────────

const CACHE = new Map<string, { json: object; fetchedAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Snap bbox to 0.5-degree grid to maximise cache hits across nearby viewports
function snapBbox(v: number, step = 0.5): number {
  return Math.floor(v / step) * step;
}

function bboxKey(w: number, s: number, e: number, n: number): string {
  return `${snapBbox(w)},${snapBbox(s)},${snapBbox(e, 0.5) + 0.5},${snapBbox(n, 0.5) + 0.5}`;
}

// ── Rate limit ──────────────────────────────────────────────────────────────

let lastOverpassCallMs = 0;
const MIN_GAP_MS = 2000;

async function waitForRateLimit() {
  const now = Date.now();
  const elapsed = now - lastOverpassCallMs;
  if (elapsed < MIN_GAP_MS) {
    await new Promise((r) => setTimeout(r, MIN_GAP_MS - elapsed));
  }
  lastOverpassCallMs = Date.now();
}

// ── Overpass query ──────────────────────────────────────────────────────────

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function buildOverpassQuery(w: number, s: number, e: number, n: number): string {
  const bbox = `${s},${w},${n},${e}`;
  return `
[out:json][timeout:25];
(
  node["man_made"="data_center"](${bbox});
  way["man_made"="data_center"](${bbox});
  relation["man_made"="data_center"](${bbox});
  node["building"="data_center"](${bbox});
  way["building"="data_center"](${bbox});
  node["telecom"="data_center"](${bbox});
  way["telecom"="data_center"](${bbox});
  node["landuse"="data_center"](${bbox});
  way["landuse"="data_center"](${bbox});
);
out center tags;
`.trim();
}

// ── Feature conversion ─────────────────────────────────────────────────────

function elementToFeature(el: OverpassElement) {
  let lat: number | undefined;
  let lng: number | undefined;

  if (el.type === "node") {
    lat = el.lat;
    lng = el.lon;
  } else if (el.center) {
    lat = el.center.lat;
    lng = el.center.lon;
  }

  if (!lat || !lng) return null;

  const tags = el.tags ?? {};
  const name = tags["name"] || tags["operator"] || `OSM ${el.type} ${el.id}`;
  const capabilities: string[] = ["colocation"];
  if (tags["telecom"]) capabilities.push("interconnect");

  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [lng, lat] },
    properties: {
      id: `osm-${el.type}-${el.id}`,
      name,
      source: "osm",
      sourceId: String(el.id),
      operator: tags["operator"] || tags["brand"] || null,
      address: [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", ") || null,
      website: tags["website"] || tags["url"] || null,
      capabilities,
      confidence: 60,
      licenseNote: "© OpenStreetMap contributors, ODbL",
      osmEditUrl: `https://www.openstreetmap.org/edit?${el.type}=${el.id}`,
    },
  };
}

// ── Handler ─────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const url = new URL(request.url);
  const west = parseFloat(url.searchParams.get("west") ?? "NaN");
  const south = parseFloat(url.searchParams.get("south") ?? "NaN");
  const east = parseFloat(url.searchParams.get("east") ?? "NaN");
  const north = parseFloat(url.searchParams.get("north") ?? "NaN");

  if ([west, south, east, north].some((v) => !Number.isFinite(v))) {
    return NextResponse.json({ error: "Missing or invalid bbox params: west, south, east, north" }, { status: 400 });
  }

  // Clamp to reasonable query area (max 5° × 5° to protect Overpass)
  const MAX_DEG = 5;
  if (east - west > MAX_DEG || north - south > MAX_DEG) {
    return NextResponse.json({ error: "Bounding box too large (max 5° × 5°)" }, { status: 400 });
  }

  const key = bboxKey(west, south, east, north);
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cached.json, {
      headers: { "X-Cache": "HIT", "Cache-Control": "public, max-age=3600" },
    });
  }

  await waitForRateLimit();

  try {
    const query = buildOverpassQuery(west, south, east, north);
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "AntimatterAI-Atlas/1.0 (https://antimatterai.com/data-center-map)",
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(28_000),
    });

    if (!res.ok) {
      console.error("[osm] Overpass error", res.status);
      return NextResponse.json({ error: "Overpass API unavailable" }, { status: 502 });
    }

    const data = await res.json();
    const elements: OverpassElement[] = data.elements ?? [];

    const features = elements
      .map((el) => elementToFeature(el))
      .filter(Boolean);

    const geojson = {
      type: "FeatureCollection",
      features,
      meta: {
        source: "openstreetmap",
        fetchedAt: new Date().toISOString(),
        elementCount: elements.length,
      },
    };

    CACHE.set(key, { json: geojson, fetchedAt: Date.now() });

    return NextResponse.json(geojson, {
      headers: { "X-Cache": "MISS", "Cache-Control": "public, max-age=3600" },
    });
  } catch (err) {
    console.error("[osm] fetch failed:", err);
    return NextResponse.json({ error: "OSM query failed" }, { status: 500 });
  }
}
