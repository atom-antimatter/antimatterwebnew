/**
 * powerMarketEnrichment.ts — Enriches Power Readiness assessments with
 * state-level and facility-level market intelligence.
 */
import { loadStates, loadFacilities } from "./loadPowerData";
import type { StateRecord, FacilityRecord } from "./powerRanking";

export type MarketEnrichment = {
  stateData: StateRecord | null;
  nearbyFacilities: FacilityRecord[];
  stateRank: number | null;
};

export function enrichWithMarketData(stateName: string): MarketEnrichment {
  const states = loadStates();
  const facilities = loadFacilities();

  const stateData = states.find(s => s.state.toLowerCase() === stateName.toLowerCase()) ?? null;
  const nearbyFacilities = facilities.filter(f => f.state.toLowerCase() === stateName.toLowerCase());

  let stateRank: number | null = null;
  if (stateData) {
    const sorted = [...states].sort((a, b) => b.power_feasibility_score - a.power_feasibility_score);
    stateRank = sorted.findIndex(s => s.state === stateData.state) + 1;
  }

  return { stateData, nearbyFacilities, stateRank };
}

export function findNearestFacility(lat: number, lng: number): FacilityRecord | null {
  const facilities = loadFacilities();
  let best: FacilityRecord | null = null;
  let bestDist = Infinity;

  for (const f of facilities) {
    if (f.lat == null || f.lng == null) continue;
    const dist = Math.sqrt(Math.pow((f.lat as number) - lat, 2) + Math.pow((f.lng as number) - lng, 2));
    if (dist < bestDist) { bestDist = dist; best = f; }
  }

  return best;
}
