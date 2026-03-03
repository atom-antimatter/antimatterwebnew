/**
 * GET /api/wikidata?bbox=west,south,east,north
 *
 * Queries Wikidata SPARQL for entities that are instances of "data center"
 * (Q180073 and related types) with geographic coordinates within the given
 * bounding box.
 *
 * Caching: 24-hour in-process cache per bbox tile (1-degree grid).
 * Rate limit: Wikidata SPARQL recommends <60 requests/min; we enforce 2 s gap.
 * Attribution: Wikidata data is CC0.
 */
import { NextResponse } from "next/server";

// ── In-process cache ────────────────────────────────────────────────────────

const CACHE = new Map<string, { json: object; fetchedAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours — Wikidata changes slowly

function snapBbox(v: number, step = 1): number {
  return Math.floor(v / step) * step;
}

function bboxKey(w: number, s: number, e: number, n: number): string {
  return `wd:${snapBbox(w)},${snapBbox(s)},${snapBbox(e)},${snapBbox(n)}`;
}

// ── Rate limit ──────────────────────────────────────────────────────────────

let lastWdCallMs = 0;
const MIN_GAP_MS = 2000;

async function waitForRateLimit() {
  const elapsed = Date.now() - lastWdCallMs;
  if (elapsed < MIN_GAP_MS) await new Promise((r) => setTimeout(r, MIN_GAP_MS - elapsed));
  lastWdCallMs = Date.now();
}

// ── SPARQL query ────────────────────────────────────────────────────────────

/**
 * Wikidata entity classes that map to "data center":
 *  Q180073 = data center
 *  Q4197316 = internet exchange point
 *  Q2655032 = colocation centre
 */
function buildSparql(w: number, s: number, e: number, n: number): string {
  return `
SELECT DISTINCT ?item ?itemLabel ?coord ?operatorLabel ?countryLabel ?instanceLabel WHERE {
  VALUES ?dcType { wd:Q180073 wd:Q4197316 wd:Q2655032 }
  ?item wdt:P31 ?dcType ;
        wdt:P625 ?coord .
  OPTIONAL { ?item wdt:P137 ?operator . }
  OPTIONAL { ?item wdt:P17 ?country . }
  OPTIONAL { ?item wdt:P31 ?instance . }

  # Filter by bounding box using geof:latitude/geof:longitude
  FILTER(geof:latitude(?coord) >= ${s} && geof:latitude(?coord) <= ${n})
  FILTER(geof:longitude(?coord) >= ${w} && geof:longitude(?coord) <= ${e})

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 200
`.trim();
}

// ── Coordinate parsing ─────────────────────────────────────────────────────

// Wikidata returns coords as "Point(lng lat)" WKT
function parseWktPoint(wkt: string): { lat: number; lng: number } | null {
  const m = wkt.match(/Point\(([^\s)]+)\s+([^\s)]+)\)/i);
  if (!m) return null;
  const lng = parseFloat(m[1]);
  const lat = parseFloat(m[2]);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

// ── Handler ─────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const url = new URL(request.url);
  const bboxStr = url.searchParams.get("bbox");
  if (!bboxStr) {
    return NextResponse.json({ error: "Missing bbox parameter (west,south,east,north)" }, { status: 400 });
  }

  const parts = bboxStr.split(",").map(Number);
  if (parts.length !== 4 || parts.some((v) => !Number.isFinite(v))) {
    return NextResponse.json({ error: "Invalid bbox" }, { status: 400 });
  }
  const [west, south, east, north] = parts;

  // Guard against huge bboxes
  if (east - west > 10 || north - south > 10) {
    return NextResponse.json({ error: "Bounding box too large (max 10° × 10°)" }, { status: 400 });
  }

  const key = bboxKey(west, south, east, north);
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cached.json, {
      headers: { "X-Cache": "HIT", "Cache-Control": "public, max-age=86400" },
    });
  }

  await waitForRateLimit();

  const sparql = buildSparql(west, south, east, north);
  const endpoint = "https://query.wikidata.org/sparql";

  try {
    const res = await fetch(
      `${endpoint}?query=${encodeURIComponent(sparql)}&format=json`,
      {
        headers: {
          Accept: "application/sparql-results+json",
          "User-Agent": "AntimatterAI-Atlas/1.0 (https://antimatterai.com; contact: atlas@antimatterai.com)",
        },
        signal: AbortSignal.timeout(30_000),
      }
    );

    if (!res.ok) {
      console.error("[wikidata] SPARQL error", res.status, await res.text());
      return NextResponse.json({ error: "Wikidata query failed" }, { status: 502 });
    }

    const data = await res.json();
    const bindings: Record<string, { value: string }>[] = data.results?.bindings ?? [];

    const features = bindings
      .map((b) => {
        const coordWkt = b.coord?.value ?? "";
        const pos = parseWktPoint(coordWkt);
        if (!pos) return null;

        const qid = (b.item?.value ?? "").replace("http://www.wikidata.org/entity/", "");
        const name = b.itemLabel?.value ?? qid;
        const operator = b.operatorLabel?.value ?? null;
        const country = b.countryLabel?.value ?? null;
        const instanceType = b.instanceLabel?.value?.toLowerCase() ?? "";

        const capabilities: string[] = ["colocation"];
        if (instanceType.includes("exchange")) capabilities.push("interconnect");
        if (instanceType.includes("colocation")) capabilities.push("carrier-neutral");

        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: [pos.lng, pos.lat] },
          properties: {
            id: `wd-${qid}`,
            name,
            source: "wikidata",
            sourceId: qid,
            operator,
            country,
            capabilities,
            confidence: 55, // Wikidata quality varies significantly
            licenseNote: "Wikidata — CC0",
            wikidataUrl: `https://www.wikidata.org/wiki/${qid}`,
          },
        };
      })
      .filter(Boolean);

    const geojson = {
      type: "FeatureCollection",
      features,
      meta: {
        source: "wikidata",
        fetchedAt: new Date().toISOString(),
        bindingCount: bindings.length,
      },
    };

    CACHE.set(key, { json: geojson, fetchedAt: Date.now() });

    return NextResponse.json(geojson, {
      headers: { "X-Cache": "MISS", "Cache-Control": "public, max-age=86400" },
    });
  } catch (err) {
    console.error("[wikidata] fetch failed:", err);
    return NextResponse.json({ error: "Wikidata query failed" }, { status: 500 });
  }
}
