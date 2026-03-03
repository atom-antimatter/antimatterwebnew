/**
 * GET /api/geocode?q=Atlanta
 *
 * Geocodes a place name or postal code via Nominatim (OSM).
 * Rate limiting: token-bucket at 1 req/s to comply with Nominatim usage policy.
 *   - We do NOT block the response for the full second; instead we queue.
 *   - Responses are cached for 7 days (geocode results change rarely).
 *
 * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
 */
import { NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

type NominatimResult = {
  lat: string;
  lon: string;
  display_name?: string;
  boundingbox?: string[];
};

// ─── In-process cache (7-day TTL) ────────────────────────────────────────────

const CACHE = new Map<string, { results: unknown[]; at: number }>();
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

// ─── Token-bucket rate limiter (1 req/s) ────────────────────────────────────

let lastNominatimCallMs = 0;
const MIN_INTERVAL_MS = 1050;
const pendingQueue: Array<() => void> = [];
let queueRunning = false;

async function nominatimThrottle(): Promise<void> {
  return new Promise<void>((resolve) => {
    pendingQueue.push(resolve);
    if (!queueRunning) drainQueue();
  });
}

async function drainQueue(): Promise<void> {
  queueRunning = true;
  while (pendingQueue.length > 0) {
    const next = pendingQueue.shift()!;
    const wait = Math.max(0, lastNominatimCallMs + MIN_INTERVAL_MS - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastNominatimCallMs = Date.now();
    next();
    // Yield before processing the next item so the awaited fetch can proceed
    await new Promise((r) => setImmediate ? setImmediate(r) : setTimeout(r, 0));
  }
  queueRunning = false;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const countryCode = searchParams.get("country");

  if (!q || typeof q !== "string" || !q.trim()) {
    return NextResponse.json(
      { error: "Missing or empty query parameter: q" },
      { status: 400 }
    );
  }

  const qNorm = q.trim().toLowerCase();
  const cacheKey = countryCode ? `${qNorm}::${countryCode}` : qNorm;

  // Check cache first (no wait, no network)
  const hit = CACHE.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL) {
    return NextResponse.json({ results: hit.results }, {
      headers: { "X-Cache": "HIT", "Cache-Control": "public, max-age=604800" },
    });
  }

  // Throttle before calling Nominatim
  await nominatimThrottle();

  const params = new URLSearchParams({
    q: q.trim(),
    format: "json",
    limit: "5",
  });
  if (countryCode?.trim()) params.set("countrycodes", countryCode.trim());

  try {
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "AntimatterAI-Atlas/1.0 (https://antimatterai.com/data-center-map)",
        "Accept-Language": "en",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Geocoding service unavailable" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as NominatimResult[];
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ results: [], message: "No results found" }, { status: 200 });
    }

    const results = data.map((r) => ({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      displayName: r.display_name ?? `${r.lat}, ${r.lon}`,
      boundingBox: r.boundingbox,
    }));

    CACHE.set(cacheKey, { results, at: Date.now() });

    return NextResponse.json({ results }, {
      headers: { "X-Cache": "MISS", "Cache-Control": "public, max-age=604800" },
    });
  } catch (err) {
    console.error("[geocode]", err);
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
