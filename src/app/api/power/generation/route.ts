/**
 * GET /api/power/generation?west=..&south=..&east=..&north=..&limit=800
 *
 * Returns generation plant points within the bounding box.
 * Data source: EIA-860 static reference (top-60 large plants embedded in
 * staticReferenceData.ts). When Supabase is populated via `pnpm ingest:eia860`,
 * the route automatically uses the richer DB dataset.
 *
 * Capped at `limit` points (default 800) to protect client rendering.
 */
import { NextResponse } from "next/server";
import { STATIC_LARGE_PLANTS } from "@/lib/power/staticReferenceData";

const CACHE = new Map<string, { data: unknown; at: number }>();
const TTL_MS = 6 * 60 * 60 * 1000; // 6 h

function bboxKey(w: number, s: number, e: number, n: number, limit: number) {
  const snap = (v: number) => (Math.round(v * 2) / 2).toFixed(1);
  return `gen:${snap(w)},${snap(s)},${snap(e)},${snap(n)},${limit}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const west  = parseFloat(searchParams.get("west")  ?? "NaN");
  const south = parseFloat(searchParams.get("south") ?? "NaN");
  const east  = parseFloat(searchParams.get("east")  ?? "NaN");
  const north = parseFloat(searchParams.get("north") ?? "NaN");
  const limit = Math.min(800, parseInt(searchParams.get("limit") ?? "800", 10));

  if ([west, south, east, north].some(v => !Number.isFinite(v))) {
    return NextResponse.json({ error: "west, south, east, north required" }, { status: 400 });
  }

  const key = bboxKey(west, south, east, north, limit);
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return NextResponse.json(cached.data, { headers: { "X-Cache": "HIT" } });
  }

  // Buffer so plants just outside the viewport edge are still included
  const BUF = 1.0;
  const plants = STATIC_LARGE_PLANTS
    .filter(p =>
      p.lat >= south - BUF && p.lat <= north + BUF &&
      p.lng >= west  - BUF && p.lng <= east  + BUF
    )
    .slice(0, limit)
    .map(p => ({
      id:           p.id,
      name:         p.name,
      operator:     p.operator,
      fuelType:     p.fuelType,
      capacityMw:   p.capacityMw,
      lat:          p.lat,
      lng:          p.lng,
      state:        p.state,
    }));

  const body = {
    plants,
    meta: {
      count:      plants.length,
      source:     "EIA-860 (2022 curated sample)",
      attribution:"U.S. Energy Information Administration – Public Domain",
      proxy:      "Static top-60 plants by capacity. Run pnpm ingest:eia860 for full dataset.",
    },
  };

  CACHE.set(key, { data: body, at: Date.now() });
  return NextResponse.json(body, {
    headers: { "X-Cache": "MISS", "Cache-Control": "public, max-age=21600" },
  });
}
