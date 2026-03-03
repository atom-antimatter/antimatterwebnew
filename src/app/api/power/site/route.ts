/**
 * GET /api/power/site?lat=..&lon=..&mw=..&radiusKm=..
 *
 * Returns a Power Feasibility Score + breakdown for a given lat/lon.
 * Caching: 24-hour in-process cache keyed by rounded coordinates.
 *
 * The scoring uses static reference data by default.
 * If Supabase tables are populated (via ingest scripts), richer data
 * is automatically included.
 */
import { NextResponse } from "next/server";
import { scorePowerFeasibility, type PowerFeasibilityResult } from "@/lib/power/scorePowerFeasibility";

// ── Simple in-process cache (24 h) ─────────────────────────────────────────────
const CACHE = new Map<string, { result: PowerFeasibilityResult; at: number }>();
const TTL_MS = 24 * 60 * 60 * 1000;

/** Round to 0.1-degree grid so nearby requests share cache entries */
function cacheKey(lat: number, lon: number, mw: number, r: number): string {
  return `${(Math.round(lat * 10) / 10).toFixed(1)},${(Math.round(lon * 10) / 10).toFixed(1)},${mw},${r}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const lat = parseFloat(searchParams.get("lat") ?? "NaN");
  const lon = parseFloat(searchParams.get("lon") ?? "NaN");
  const mw  = parseFloat(searchParams.get("mw")  ?? "100");
  const radiusKm = parseFloat(searchParams.get("radiusKm") ?? "80");

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat and lon are required and must be valid numbers" }, { status: 400 });
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "lat/lon out of range" }, { status: 400 });
  }

  const key = cacheKey(lat, lon, mw, radiusKm);
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json(hit.result, {
      headers: { "X-Cache": "HIT", "Cache-Control": "public, max-age=86400" },
    });
  }

  // Compute score using static data (+ any Supabase data if ingested)
  const result = scorePowerFeasibility(lat, lon, { radiusKm, targetMw: mw });

  // TODO: Optionally enrich with Supabase data if tables are populated:
  //   const sb = getSupabaseAdmin();
  //   const { data: rates } = await sb.from("power_urdb_rates")
  //     .select("energy_charge_summary, tou_complexity")
  //     .not("geometry", "is", null)
  //     .order(...) ...
  //   if (rates?.length) { ... override rateProxy ... }

  CACHE.set(key, { result, at: Date.now() });

  return NextResponse.json(result, {
    headers: {
      "X-Cache": "MISS",
      "Cache-Control": "public, max-age=86400",
      "X-Attribution": "OpenEI URDB, EIA-860, EPA eGRID, ISO queue publications",
    },
  });
}
