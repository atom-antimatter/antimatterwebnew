/**
 * gazetteer.ts
 *
 * Local fuzzy search index for:
 *   - Cities (from /public/geo/populated_places.geojson)
 *   - US ZIP codes (stubbed — see loadZipCentroids)
 *   - Data center / facility names (from DATA_CENTERS)
 *
 * Uses Fuse.js for fuzzy matching so "Londun", "frankf", "NY" all resolve.
 *
 * Call initGazetteer() once at app startup; then searchGazetteer() is
 * synchronous and fast (<5 ms for most queries).
 */

import Fuse from "fuse.js";
import { normalise, isUsZip, CITY_ALIASES } from "./normalize";
import { DATA_CENTERS, type DataCenter } from "@/data/dataCenters";

// ─── Result type ──────────────────────────────────────────────────────────────

export type GazetteerResult = {
  kind: "city" | "zip" | "facility" | "geocode";
  label: string;        // display label (e.g. "London, England, UK")
  sublabel?: string;    // secondary (e.g. "Colocation · Equinix")
  lat: number;
  lng: number;
  /** Fuse score (0 = perfect match, 1 = no match). Lower is better. */
  score: number;
  /** Attached DC object when kind="facility" */
  dc?: DataCenter;
  /** Bounding-box for fly-to (west, south, east, north in degrees) */
  bbox?: [number, number, number, number];
};

// ─── Internal index entry ─────────────────────────────────────────────────────

type IndexEntry = {
  kind: "city" | "zip" | "facility" | "geocode";
  /** All searchable text, normalised */
  searchKey: string;
  /** Original (un-normalised) display name */
  name: string;
  country: string;
  region?: string;      // state/province
  lat: number;
  lng: number;
  population?: number;
  dc?: DataCenter;
};

// ─── Singleton state ──────────────────────────────────────────────────────────

let fuse: Fuse<IndexEntry> | null = null;
const zipMap: Map<string, { lat: number; lng: number; city: string; state: string }> = new Map();
let ready = false;
let initPromise: Promise<void> | null = null;

// ─── Loaders ──────────────────────────────────────────────────────────────────

async function loadCities(): Promise<IndexEntry[]> {
  try {
    const res = await fetch("/geo/populated_places.geojson");
    if (!res.ok) return [];
    const geo = await res.json();
    return (geo?.features ?? []).map((f: any) => {
      const p = f.properties ?? {};
      const [lng, lat] = f.geometry?.coordinates ?? [0, 0];
      const name  = String(p.NAME ?? p.name ?? "");
      const adm0  = String(p.ADM0NAME ?? p.sov0name ?? "");
      const adm1  = String(p.ADM1NAME ?? "");

      // Composite search key includes aliases, country, region
      const alias = Object.entries(CITY_ALIASES).find(([, v]) => v === name.toLowerCase())?.[0] ?? "";
      const searchKey = [normalise(name), normalise(adm0), normalise(adm1), alias].filter(Boolean).join(" ");

      return {
        kind: "city" as const,
        searchKey,
        name,
        country: adm0,
        region: adm1,
        lat: Number(lat),
        lng: Number(lng),
        population: p.POP_MAX ? Number(p.POP_MAX) : undefined,
      };
    }).filter((e: IndexEntry) => e.name && Number.isFinite(e.lat) && Number.isFinite(e.lng));
  } catch {
    return [];
  }
}

function loadFacilities(): IndexEntry[] {
  return DATA_CENTERS.map((dc) => ({
    kind: "facility" as const,
    searchKey: normalise(
      [dc.name, dc.city, dc.stateOrRegion, dc.country, dc.provider, ...(dc.capabilities ?? [])].filter(Boolean).join(" ")
    ),
    name: dc.name,
    country: dc.country,
    region: dc.stateOrRegion,
    lat: dc.lat,
    lng: dc.lng,
    dc,
  }));
}

/**
 * Stub for US ZIP centroids.
 * When /public/geo/us_zip_centroids.csv is added, replace this stub.
 *
 * Expected CSV format: zip,lat,lng,city,state
 * e.g.  30308,33.7490,-84.3880,Atlanta,GA
 *
 * Attribution if you add the dataset: USPS/Census-derived; many open sources
 * available (e.g. geonames, simplemaps.com free tier, or Census ZCTA centroids).
 */
async function loadZipCentroids(): Promise<void> {
  try {
    const res = await fetch("/geo/us_zip_centroids.csv");
    if (!res.ok) return;          // file not present yet — silent skip
    const text = await res.text();
    const lines = text.trim().split("\n").slice(1); // skip header
    for (const line of lines) {
      const [zip, latStr, lngStr, city, state] = line.split(",");
      if (!zip || !latStr || !lngStr) continue;
      zipMap.set(zip.trim(), {
        lat: parseFloat(latStr),
        lng: parseFloat(lngStr),
        city: city?.trim() ?? "",
        state: state?.trim() ?? "",
      });
    }
  } catch {
    // no-op
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export async function initGazetteer(): Promise<void> {
  if (ready) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const [cities] = await Promise.all([
      loadCities(),
      loadZipCentroids(),
    ]);
    const facilities = loadFacilities();
    const entries: IndexEntry[] = [...cities, ...facilities];

    fuse = new Fuse(entries, {
      keys: [
        { name: "name",      weight: 0.5 },
        { name: "searchKey", weight: 0.35 },
        { name: "country",   weight: 0.1 },
        { name: "region",    weight: 0.05 },
      ],
      threshold:        0.4,  // 0 = exact, 1 = all; 0.4 is a good middle ground
      distance:         150,
      minMatchCharLength: 2,
      includeScore:     true,
      useExtendedSearch: false,
    });

    ready = true;
  })();

  return initPromise;
}

// ─── Search ───────────────────────────────────────────────────────────────────

/**
 * Search the local gazetteer for cities, ZIPs, and facilities.
 *
 * @param rawQuery  The user's typed string (un-normalised).
 * @param limit     Max results to return (default 8).
 */
export function searchGazetteer(rawQuery: string, limit = 8): GazetteerResult[] {
  const query = rawQuery.trim();
  if (!query || query.length < 2) return [];

  const results: GazetteerResult[] = [];

  // ── 1. Exact ZIP match ──────────────────────────────────────────────────────
  if (isUsZip(query)) {
    const zip = zipMap.get(query);
    if (zip) {
      results.push({
        kind: "zip",
        label: `${query} — ${zip.city}, ${zip.state}`,
        sublabel: "US ZIP code",
        lat: zip.lat,
        lng: zip.lng,
        score: 0,
      });
      return results; // ZIP exact match is definitive
    }
    // ZIP not in our dataset — let caller fall through to Nominatim
    return [];
  }

  // ── 2. Fuzzy search cities + facilities ────────────────────────────────────
  if (!fuse) return [];

  const normalised = normalise(query);
  const raw = fuse.search(normalised, { limit: limit * 3 });

  for (const { item, score } of raw) {
    if ((score ?? 1) > 0.45) continue;

    if (item.kind === "facility") {
      results.push({
        kind: "facility",
        label: item.name,
          sublabel: [item.dc?.provider, [item.dc?.city, item.region, item.country].filter(Boolean).join(", ")].filter(Boolean).join(" · "),
        lat: item.lat,
        lng: item.lng,
        score: score ?? 1,
        dc: item.dc,
      });
    } else {
      const parts = [item.name, item.region, item.country].filter(Boolean);
      results.push({
        kind: "city",
        label: parts.join(", "),
        sublabel: item.population ? `Pop. ${(item.population / 1_000_000).toFixed(1)}M` : undefined,
        lat: item.lat,
        lng: item.lng,
        score: score ?? 1,
      });
    }

    if (results.length >= limit) break;
  }

  return results;
}

/** True once initGazetteer() has completed. */
export function isGazetteerReady(): boolean {
  return ready;
}
