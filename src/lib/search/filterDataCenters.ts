import type { DataCenter } from "@/data/dataCenters";
import { getDataCenterSearchText } from "@/data/dataCenters";
import { haversineKm } from "@/lib/geo/haversine";

export type FilterParams = {
  /** Geocoded coordinate to use as the centre of a radius search. */
  geocodedPos?: { lat: number; lng: number } | null;
  /** Search radius in km (only used when geocodedPos is set). Default 500. */
  radiusKm?: number;
  /** Capability filters — only include DCs that have ALL of these capabilities. */
  capabilities?: string[];
  /** Tier filter. */
  tier?: string | null;
  /** Free-text query for fallback text-match (used when no geocodedPos). */
  textQuery?: string;
};

/**
 * Filter the provided data centers and return a sorted list.
 *
 * Priority:
 * 1. If geocodedPos is provided, filter by distance + optional capability/tier.
 * 2. Otherwise fall back to text search across all searchable fields.
 *
 * Results are sorted by distance (ascending) when geocodedPos is available,
 * or by name otherwise.
 */
export function filterDataCenters(
  allDCs: readonly DataCenter[],
  params: FilterParams
): DataCenter[] {
  const { geocodedPos, radiusKm = 500, capabilities = [], tier, textQuery } = params;

  let list: DataCenter[] = [];

  if (geocodedPos) {
    // Radius-based search
    list = allDCs.filter((dc) => {
      const dist = haversineKm(geocodedPos.lat, geocodedPos.lng, dc.lat, dc.lng);
      return dist <= radiusKm;
    });

    // Sort by distance ascending
    list.sort((a, b) => {
      const da = haversineKm(geocodedPos.lat, geocodedPos.lng, a.lat, a.lng);
      const db = haversineKm(geocodedPos.lat, geocodedPos.lng, b.lat, b.lng);
      return da - db;
    });
  } else if (textQuery?.trim()) {
    // Text-only fallback
    const q = textQuery.trim().toLowerCase();
    list = allDCs.filter((dc) => getDataCenterSearchText(dc).includes(q));
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    list = [...allDCs];
  }

  // Capability filter: ALL specified capabilities must be present
  if (capabilities.length > 0) {
    list = list.filter((dc) =>
      capabilities.every((cap) => dc.capabilities.includes(cap))
    );
  }

  // Tier filter
  if (tier) {
    list = list.filter((dc) => dc.tier === tier);
  }

  return list;
}
