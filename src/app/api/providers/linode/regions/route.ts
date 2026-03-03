/**
 * GET /api/providers/linode/regions
 *
 * Returns all Linode regions with coordinates for map rendering.
 * Falls back to live Linode API + coordinate file if DB is not populated.
 * Cache: 1 hour.
 */
import { NextResponse } from "next/server";
import { fetchLinodeRegions, fetchLinodeAvailability } from "@/lib/providers/linode/fetch";
import { normalizeLinodeRegions } from "@/lib/providers/linode/normalize";

let cache: { data: unknown; at: number } | null = null;
const TTL_MS = 60 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json(cache.data, { headers: { "X-Cache": "HIT" } });
  }

  try {
    const [regions, availability] = await Promise.allSettled([
      fetchLinodeRegions(),
      fetchLinodeAvailability(),
    ]);

    const regionData = regions.status === "fulfilled" ? regions.value : [];
    const availData  = availability.status === "fulfilled" ? availability.value : [];

    const normalized = await normalizeLinodeRegions(regionData, availData);

    // Only return regions that have coordinates (for map rendering)
    // Regions without coords still exist in the response with lat/lng = null,
    // so the client can show them in a list even without placing them on the map.
    const body = {
      regions: normalized,
      meta: {
        total:        normalized.length,
        withCoords:   normalized.filter(r => r.lat !== null).length,
        attribution:  "Akamai/Linode API v4",
        source:       "https://api.linode.com/v4/regions",
      },
    };

    cache = { data: body, at: Date.now() };
    return NextResponse.json(body, {
      headers: { "X-Cache": "MISS", "Cache-Control": "public, max-age=3600" },
    });
  } catch (err) {
    console.error("[linode/regions]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
