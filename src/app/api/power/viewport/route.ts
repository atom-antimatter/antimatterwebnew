/**
 * GET /api/power/viewport?west=..&south=..&east=..&north=..&mw=..&grid=..
 *
 * Divides the viewport into a grid (default 10×10) and returns a Power
 * Feasibility Score for each cell centre. Used by the heatmap layer.
 *
 * Returns: { cells: [ { west, south, east, north, score, signals } ] }
 *
 * Caching: 24-hour in-process cache per grid key.
 * Max bbox: 30° × 20° to prevent abuse.
 */
import { NextResponse } from "next/server";
import {
  scorePowerFeasibility,
  scoreToCesiumColor,
  type SignalBreakdown,
} from "@/lib/power/scorePowerFeasibility";

// ── Cache ──────────────────────────────────────────────────────────────────────
type CellResult = {
  west: number; south: number; east: number; north: number;
  score: number;
  signals: SignalBreakdown;
  color: { r: number; g: number; b: number; a: number };
};

const CACHE = new Map<string, { cells: CellResult[]; at: number }>();
const TTL_MS = 24 * 60 * 60 * 1000;

function snapBbox(v: number, step = 2): number {
  return Math.floor(v / step) * step;
}

function bboxCacheKey(w: number, s: number, e: number, n: number, grid: number, mw: number): string {
  return `${snapBbox(w)},${snapBbox(s)},${snapBbox(e)},${snapBbox(n)},${grid},${mw}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const west  = parseFloat(searchParams.get("west")  ?? "NaN");
  const south = parseFloat(searchParams.get("south") ?? "NaN");
  const east  = parseFloat(searchParams.get("east")  ?? "NaN");
  const north = parseFloat(searchParams.get("north") ?? "NaN");
  const mw    = parseFloat(searchParams.get("mw")    ?? "100");
  const grid  = Math.min(20, Math.max(4, parseInt(searchParams.get("grid") ?? "10", 10)));

  if ([west, south, east, north].some((v) => !Number.isFinite(v))) {
    return NextResponse.json({ error: "west, south, east, north are required" }, { status: 400 });
  }

  // Guard against huge bboxes (performance + abuse)
  const dLon = east - west;
  const dLat = north - south;
  if (dLon > 30 || dLat > 20 || dLon <= 0 || dLat <= 0) {
    return NextResponse.json({ error: "Bounding box must be ≤ 30° wide and 20° tall" }, { status: 400 });
  }

  const key = bboxCacheKey(west, south, east, north, grid, mw);
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json({ cells: hit.cells }, {
      headers: { "X-Cache": "HIT", "Cache-Control": "public, max-age=86400" },
    });
  }

  const cellW = dLon / grid;
  const cellH = dLat / grid;

  const cells: CellResult[] = [];

  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < grid; col++) {
      const cellWest  = west  + col * cellW;
      const cellSouth = south + row * cellH;
      const cellEast  = cellWest  + cellW;
      const cellNorth = cellSouth + cellH;
      const centreLat = (cellSouth + cellNorth) / 2;
      const centreLon = (cellWest  + cellEast)  / 2;

      const result = scorePowerFeasibility(centreLat, centreLon, {
        radiusKm: 80,
        targetMw: mw,
      });

      cells.push({
        west: cellWest, south: cellSouth, east: cellEast, north: cellNorth,
        score: result.score,
        signals: result.signals,
        color: scoreToCesiumColor(result.score),
      });
    }
  }

  CACHE.set(key, { cells, at: Date.now() });

  return NextResponse.json({ cells, meta: { grid, totalCells: cells.length, mw } }, {
    headers: { "X-Cache": "MISS", "Cache-Control": "public, max-age=86400" },
  });
}
