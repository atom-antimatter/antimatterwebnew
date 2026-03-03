/**
 * cityIndex — Zoom-level-aware city dataset loader.
 *
 * Loads Natural Earth populated_places_simple once, then provides fast
 * filtered subsets based on CameraState (scalerank + viewport clipping).
 */
import type { CameraLevel, CameraState } from "../useCameraLevel";

// ─── types ────────────────────────────────────────────────────────────────────

export type CityPoint = {
  name: string;
  lat: number;
  lng: number;
  scalerank: number;
  adm0: string;   // country name
  adm1?: string;  // province/state
  pop?: number;   // population if available
};

// ─── constants ────────────────────────────────────────────────────────────────

const SCALERANK_REGION = 2;   // top ~200 cities globally
const SCALERANK_LOCAL = 5;    // top ~2000 cities
const MAX_CITY_LABELS = 300;  // hard cap per render cycle (prevents entity flood)

// ─── singleton state ──────────────────────────────────────────────────────────

let allCities: CityPoint[] = [];
let loadPromise: Promise<void> | null = null;
let isLoaded = false;

// Pre-computed buckets
let regionBucket: CityPoint[] = [];
let localBucket: CityPoint[] = [];

// ─── loader ───────────────────────────────────────────────────────────────────

export async function initCityIndex(): Promise<void> {
  if (isLoaded) return;
  if (loadPromise) return loadPromise;

  loadPromise = fetch("/geo/populated_places.geojson")
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to load populated_places.geojson: ${r.status}`);
      return r.json();
    })
    .then((geo) => {
      const features: any[] = geo?.features ?? [];

      allCities = features
        .map((f: any) => {
          const p = f.properties ?? {};
          const [lng, lat] = f.geometry?.coordinates ?? [0, 0];
          return {
            name: String(p.NAME ?? p.name ?? ""),
            lat: Number(lat),
            lng: Number(lng),
            scalerank: Number(p.SCALERANK ?? p.scalerank ?? 9),
            adm0: String(p.ADM0NAME ?? p.sov0name ?? ""),
            adm1: p.ADM1NAME ? String(p.ADM1NAME) : undefined,
            pop: p.POP_MAX ? Number(p.POP_MAX) : undefined,
          } as CityPoint;
        })
        .filter((c) => c.name && Number.isFinite(c.lat) && Number.isFinite(c.lng));

      // Sort by scalerank ascending so smallest rank (most important) comes first
      allCities.sort((a, b) => a.scalerank - b.scalerank);

      // Pre-compute fixed buckets
      regionBucket = allCities.filter((c) => c.scalerank <= SCALERANK_REGION);
      localBucket = allCities.filter((c) => c.scalerank <= SCALERANK_LOCAL);

      isLoaded = true;
    })
    .catch((err) => {
      console.error("[cityIndex] Failed to load city data:", err);
      allCities = [];
      isLoaded = true;
    });

  return loadPromise;
}

// ─── LOD filter ───────────────────────────────────────────────────────────────

/**
 * Return the appropriate city subset for the given camera state.
 * Always returns a new array (safe to use as entity source).
 */
export function getCitiesForLevel(state: CameraState): CityPoint[] {
  if (!isLoaded) return [];
  const { level, viewRect } = state;

  switch (level) {
    case "WORLD":
      return [];

    case "REGION":
      return regionBucket.slice(0, MAX_CITY_LABELS);

    case "LOCAL":
      return localBucket.slice(0, MAX_CITY_LABELS);

    case "CITY": {
      if (!viewRect) return localBucket.slice(0, MAX_CITY_LABELS);

      // Filter to viewport only; add a small buffer so labels near edges are visible
      const BUF = 1.5; // degrees
      const { west, south, east, north } = viewRect;

      // Handle antimeridian crossing (east < west)
      const crossesAntimeridian = east < west;

      const inView = allCities.filter((c) => {
        if (c.lat < south - BUF || c.lat > north + BUF) return false;
        if (crossesAntimeridian) {
          return c.lng >= west - BUF || c.lng <= east + BUF;
        }
        return c.lng >= west - BUF && c.lng <= east + BUF;
      });

      // Limit to prevent entity overflow; prioritise by scalerank (already sorted)
      return inView.slice(0, MAX_CITY_LABELS);
    }
  }
}

/**
 * Attempt a fast local lookup of a city by approximate name match.
 * Returns null if not found — callers should fall back to Nominatim.
 */
export function findCityByName(query: string): CityPoint | null {
  if (!isLoaded || allCities.length === 0) return null;
  const q = query.trim().toLowerCase();
  return (
    allCities.find((c) => c.name.toLowerCase() === q) ??
    allCities.find((c) => c.name.toLowerCase().startsWith(q)) ??
    null
  );
}
