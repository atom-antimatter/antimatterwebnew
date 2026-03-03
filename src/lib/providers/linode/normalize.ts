/**
 * Merge Linode /regions + /regions/availability + coordinate lookup into
 * a single ProviderRegion record per region.
 */
import type { LinodeRegion, LinodeAvailability, ProviderRegion } from "./types";

// ─── Coordinate lookup ────────────────────────────────────────────────────────
// Loaded lazily (server-only; this module is never sent to the browser).

let _coords: Record<string, { lat: number; lng: number; city: string; country: string; metro?: string }> | null = null;

async function loadCoords() {
  if (_coords) return _coords;
  try {
    // Dynamic import of the JSON file so it isn't bundled into the client chunk
    const mod = await import("../../../../data/linode-region-coordinates.json");
    const raw = mod.default as Record<string, unknown>;
    // Strip the _comment / _source / _updated metadata keys
    _coords = Object.fromEntries(
      Object.entries(raw)
        .filter(([k]) => !k.startsWith("_"))
        .map(([k, v]) => [k, v as { lat: number; lng: number; city: string; country: string; metro?: string }])
    );
  } catch (e) {
    console.error("[linode/normalize] Could not load coordinate file:", e);
    _coords = {};
  }
  return _coords;
}

// ─── Availability map ─────────────────────────────────────────────────────────

function buildAvailabilityMap(avail: LinodeAvailability[]): Map<string, LinodeAvailability> {
  return new Map(avail.map(a => [a.region, a]));
}

// ─── Normaliser ───────────────────────────────────────────────────────────────

export async function normalizeLinodeRegions(
  regions:      LinodeRegion[],
  availability: LinodeAvailability[],
): Promise<ProviderRegion[]> {
  const coords     = await loadCoords();
  const availMap   = buildAvailabilityMap(availability);
  const now        = new Date().toISOString();

  const missing: string[] = [];

  const result: ProviderRegion[] = regions.map(r => {
    const coord = coords[r.id];
    if (!coord) {
      missing.push(r.id);
      console.warn(`[linode/normalize] No coordinates for region ${r.id} — storing null`);
    }

    const avail = availMap.get(r.id);
    let status: string | null = null;
    if (r.status) status = r.status === "ok" ? "active" : "outage";

    return {
      provider:     "akamai_linode",
      region_id:    r.id,
      label:        r.label ?? r.id,
      country:      coord?.country ?? r.country ?? null,
      city:         coord?.city ?? null,
      metro:        coord?.metro ?? null,
      site_type:    r.site_type ?? null,
      lat:          coord?.lat ?? null,
      lng:          coord?.lng ?? null,
      capabilities: r.capabilities ?? [],
      availability: avail ? { available: avail.available } : null,
      status,
      source:       { api: "linode_v4", fetchedAt: now },
    };
  });

  if (missing.length > 0) {
    console.warn(`[linode/normalize] ${missing.length} regions missing coordinates: ${missing.join(", ")}`);
  }

  return result;
}

/** Return region_ids that have no entry in the coordinates file. */
export async function getMissingCoords(regionIds: string[]): Promise<string[]> {
  const coords = await loadCoords();
  return regionIds.filter(id => !coords[id]);
}
