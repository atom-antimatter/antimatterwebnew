/**
 * GET /api/power/queue?west=..&south=..&east=..&north=..
 *
 * Returns interconnection queue data within the bounding box.
 *
 * Since individual queue projects rarely include precise lat/lon in public
 * spreadsheets, this route returns STATE-LEVEL AGGREGATES (queued MW per state)
 * for states that intersect the requested bbox.
 *
 * These are clearly labeled "approximate" — do not display as precise point data.
 *
 * Data source: MISO/PJM/ERCOT/CAISO 2024 Q1 summary (from staticReferenceData.ts).
 * Run `pnpm ingest:queue:miso` to populate the DB with individual project records.
 */
import { NextResponse } from "next/server";
import { QUEUE_MW_BY_STATE, STATE_BBOX } from "@/lib/power/staticReferenceData";

const CACHE = new Map<string, { data: unknown; at: number }>();
const TTL_MS = 6 * 60 * 60 * 1000;

function bboxKey(w: number, s: number, e: number, n: number) {
  const snap = (v: number) => (Math.round(v * 2) / 2).toFixed(1);
  return `queue:${snap(w)},${snap(s)},${snap(e)},${snap(n)}`;
}

/** Approximate centroid of a state bbox */
function stateCentroid(bbox: [number, number, number, number]) {
  const [w, s, e, n] = bbox;
  return { lat: (s + n) / 2, lng: (w + e) / 2 };
}

/** Bboxes overlap (including touch) */
function bboxOverlap(
  [w1, s1, e1, n1]: [number, number, number, number],
  w2: number, s2: number, e2: number, n2: number
) {
  return w1 <= e2 && e1 >= w2 && s1 <= n2 && n1 >= s2;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const west  = parseFloat(searchParams.get("west")  ?? "NaN");
  const south = parseFloat(searchParams.get("south") ?? "NaN");
  const east  = parseFloat(searchParams.get("east")  ?? "NaN");
  const north = parseFloat(searchParams.get("north") ?? "NaN");

  if ([west, south, east, north].some(v => !Number.isFinite(v))) {
    return NextResponse.json({ error: "west, south, east, north required" }, { status: 400 });
  }

  const key = bboxKey(west, south, east, north);
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return NextResponse.json(cached.data, { headers: { "X-Cache": "HIT" } });
  }

  // Find states whose bbox intersects the query bbox
  const stateAggs = Object.entries(STATE_BBOX)
    .filter(([, bbox]) => bboxOverlap(bbox, west, south, east, north))
    .map(([state, bbox]) => {
      const queuedMw = QUEUE_MW_BY_STATE[state] ?? null;
      const { lat, lng } = stateCentroid(bbox);
      return {
        state,
        queuedMw,
        lat,
        lng,
        approximate: true, // coordinates are state centroid, NOT a specific facility
      };
    })
    .filter(s => s.queuedMw !== null);

  const body = {
    aggregates: stateAggs,
    geometryType: "state_centroid_approximate",
    meta: {
      count:      stateAggs.length,
      source:     "MISO/PJM/CAISO/ERCOT/SPP public queue publications (2024 Q1 summary)",
      attribution:"ISO/RTO public queue reports. Queued MW ≠ available capacity.",
      proxy:      "State-level aggregate. Run pnpm ingest:queue:miso for project-level data.",
      warning:    "Coordinates are state centroids, not facility locations.",
    },
  };

  CACHE.set(key, { data: body, at: Date.now() });
  return NextResponse.json(body, {
    headers: { "X-Cache": "MISS", "Cache-Control": "public, max-age=21600" },
  });
}
