/**
 * searchPipeline.ts
 *
 * Combined 3-stage search pipeline:
 *   Stage 1 — Local gazetteer (Fuse.js, synchronous, offline).
 *   Stage 2 — Nominatim geocode fallback (cached server-side).
 *   Stage 3 — OpenAI NLP intent parse (async, non-blocking, with fallback).
 *
 * Usage:
 *   const result = await runSearchPipeline("edge + gpu near london");
 *   // Use result.location for camera flyTo
 *   // Use result.filters for capability / tier filters
 */

import { parseSearchQuery, type ParsedQuery } from "./parseSearchQuery";
import { searchGazetteer, type GazetteerResult } from "./gazetteer";
import { normalise } from "./normalize";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SearchLocation = {
  lat: number;
  lng: number;
  /** Degree bounding box for fly-to if available */
  bbox?: [number, number, number, number]; // [west, south, east, north]
  displayName: string;
  kind: "city" | "zip" | "facility" | "geocode";
  /** Attached DC (only when kind="facility") */
  dc?: import("@/data/dataCenters").DataCenter;
};

export type SearchFilters = {
  capabilities: string[];
  tier: ParsedQuery["tier"];
  provider?: string;
  radiusKm: number;
};

export type SearchPipelineResult = {
  location: SearchLocation | null;
  filters: SearchFilters;
  /** Was location found via local gazetteer (fast-path)? */
  fromGazetteer: boolean;
  /** Was NLP parse used? */
  nlpUsed: boolean;
  /** NLP-sourced location query (may differ from original) */
  nlpLocationQuery?: string;
};

export type NLPParseResult = {
  location_query: string | null;
  radius_km: number;
  capabilities: string[];
  tier: "core" | "edge" | "hyperscale" | "enterprise" | null;
  provider: string | null;
  entity_type: "datacenter" | "facility" | "ixp" | "any";
  mode: "fly_to_location" | "filter_only" | "select_entity";
};

// ─── Geocode helper ───────────────────────────────────────────────────────────

type GeocodeApiResult = {
  lat: number;
  lng: number;
  displayName: string;
  boundingBox?: string[];
};

async function callGeocode(query: string): Promise<SearchLocation | null> {
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const results: GeocodeApiResult[] = Array.isArray(data.results) ? data.results : [];
    if (results.length === 0) return null;
    const first = results[0];
    const bbox = first.boundingBox && first.boundingBox.length === 4
      ? ([
          parseFloat(first.boundingBox[2]), // west
          parseFloat(first.boundingBox[0]), // south
          parseFloat(first.boundingBox[3]), // east
          parseFloat(first.boundingBox[1]), // north
        ] as [number, number, number, number])
      : undefined;
    return { lat: first.lat, lng: first.lng, displayName: first.displayName, kind: "geocode", bbox };
  } catch {
    return null;
  }
}

// ─── NLP parse helper ─────────────────────────────────────────────────────────

// 24-hour in-browser cache for NLP parse results
const NLP_CACHE = new Map<string, { result: NLPParseResult; at: number }>();
const NLP_TTL = 24 * 60 * 60 * 1000;

async function callNLPParse(query: string): Promise<NLPParseResult | null> {
  const key = normalise(query);
  const hit = NLP_CACHE.get(key);
  if (hit && Date.now() - hit.at < NLP_TTL) return hit.result;

  try {
    const res = await fetch("/api/search/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data.location_query === "undefined") return null;
    NLP_CACHE.set(key, { result: data, at: Date.now() });
    return data as NLPParseResult;
  } catch {
    return null; // NLP is non-blocking; never propagate errors
  }
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

/**
 * Run the 3-stage search pipeline for a user query.
 *
 * The caller controls whether NLP is requested (`useNLP=true`).
 * When NLP is enabled, it fires in parallel with local search and
 * supplements the result (e.g. adding capability filters).
 */
export async function runSearchPipeline(
  rawQuery: string,
  options: { useNLP?: boolean; defaultRadiusKm?: number } = {}
): Promise<SearchPipelineResult> {
  const { useNLP = true, defaultRadiusKm = 500 } = options;

  // ── Stage 0: deterministic parse for capabilities + tier ───────────────────
  const parsed = parseSearchQuery(rawQuery);
  const filters: SearchFilters = {
    capabilities: parsed.capabilities,
    tier: parsed.tier,
    radiusKm: defaultRadiusKm,
  };

  // Fire NLP parse in parallel (don't await yet)
  const nlpPromise = useNLP ? callNLPParse(rawQuery) : Promise.resolve(null);

  // ── Stage 1: local gazetteer (fast-path) ───────────────────────────────────
  const placeQuery = parsed.placeQuery || rawQuery;
  const gazetResults = searchGazetteer(placeQuery, 5);

  // Strong gazetteer match = score < 0.25 or exact facility match
  const strongMatch = gazetResults.find(
    (r) => r.score < 0.25 || r.kind === "facility"
  );

  let location: SearchLocation | null = null;
  let fromGazetteer = false;

  if (strongMatch) {
    const k = strongMatch.kind === "zip" || strongMatch.kind === "facility" ? strongMatch.kind : "city";
    location = {
      lat: strongMatch.lat,
      lng: strongMatch.lng,
      displayName: strongMatch.label,
      kind: k as SearchLocation["kind"],
      dc: strongMatch.dc,
      bbox: strongMatch.bbox,
    };
    fromGazetteer = true;
  }

  // ── Stage 2: geocode fallback ──────────────────────────────────────────────
  if (!location && placeQuery) {
    location = await callGeocode(placeQuery);
  }

  // ── Stage 3: NLP enrichment ────────────────────────────────────────────────
  let nlpUsed = false;
  let nlpLocationQuery: string | undefined;

  const nlpResult = await nlpPromise;
  if (nlpResult) {
    nlpUsed = true;

    // Merge NLP capabilities with deterministic parse (union)
    const nlpCaps = nlpResult.capabilities ?? [];
    filters.capabilities = Array.from(new Set([...filters.capabilities, ...nlpCaps]));

    if (nlpResult.tier) filters.tier = nlpResult.tier;
    if (nlpResult.provider) filters.provider = nlpResult.provider;
    if (nlpResult.radius_km > 0) filters.radiusKm = nlpResult.radius_km;

    // If NLP suggests a location query that differs from what we already used
    if (nlpResult.location_query && !location) {
      nlpLocationQuery = nlpResult.location_query;
      // Try gazetteer with NLP-extracted location
      const nlpGaz = searchGazetteer(nlpResult.location_query, 3);
      const nlpMatch = nlpGaz[0];
      if (nlpMatch && nlpMatch.score < 0.4) {
        const kk = nlpMatch.kind === "zip" || nlpMatch.kind === "facility" ? nlpMatch.kind : "city";
        location = {
          lat: nlpMatch.lat,
          lng: nlpMatch.lng,
          displayName: nlpMatch.label,
          kind: kk as SearchLocation["kind"],
          dc: nlpMatch.dc,
        };
        fromGazetteer = true;
      } else {
        location = await callGeocode(nlpResult.location_query);
      }
    }
  }

  return { location, filters, fromGazetteer, nlpUsed, nlpLocationQuery };
}
