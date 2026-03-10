/**
 * powerRanking.ts — Composite scoring and ranking for power market intelligence.
 *
 * Configurable weights allow Atlas to rank states and facilities by different
 * criteria without changing the underlying data model.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type StateRecord = {
  state: string;
  commercial_rate_kwh: number;
  industrial_rate_kwh: number;
  power_feasibility_score: number;
  dc_capacity_mw: number;
  annual_consumption_twh: number;
  key_markets: string;
  tier: string;
  notes: string;
  estimated_monthly_cost_100kw: number;
  annual_cost_1mw: number;
};

export type FacilityRecord = {
  provider: string;
  facility_name: string;
  city: string;
  state: string;
  power_feasibility_score: number;
  utility_rate: number;
  queue_pressure: number;
  generation: number;
  grid_carbon: number;
  est_rate_kwh: number;
  grid_carbon_lb_mwh: number;
  tier_rating: string;
  pue: number;
  renewable_energy_pct: number;
  notes: string;
  monthly_cost_10kw: number;
  monthly_cost_100kw: number;
  annual_cost_1mw: number;
  lat?: number | null;
  lng?: number | null;
};

// ─── Weights (single place to tune) ──────────────────────────────────────────

export const DEFAULT_STATE_WEIGHTS = {
  feasibility: 0.35,
  rateCost: 0.30,
  capacity: 0.20,
  tier: 0.15,
};

export const DEFAULT_FACILITY_WEIGHTS = {
  feasibility: 0.25,
  rateCost: 0.20,
  pue: 0.15,
  renewable: 0.15,
  tier: 0.15,
  carbon: 0.10,
};

// ─── Normalization helpers ───────────────────────────────────────────────────

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function invertNormalize(value: number, min: number, max: number): number {
  return 1 - normalize(value, min, max);
}

const TIER_SCORES: Record<string, number> = {
  "Tier 1": 1.0, "Tier 2": 0.75, "Tier 3": 0.5, "Tier 4": 0.25, "Tier 5": 0.1,
  "Tier IV": 1.0, "Tier III": 0.75, "Tier II": 0.5, "Tier I": 0.25,
};

function tierScore(tier: string): number {
  return TIER_SCORES[tier] ?? 0.5;
}

// ─── State composite score ───────────────────────────────────────────────────

export function scoreState(
  s: StateRecord,
  allStates: StateRecord[],
  weights = DEFAULT_STATE_WEIGHTS,
): number {
  const rates = allStates.map(x => x.industrial_rate_kwh);
  const caps = allStates.map(x => x.dc_capacity_mw);

  const feasibility = s.power_feasibility_score / 100;
  const rateCost = invertNormalize(s.industrial_rate_kwh, Math.min(...rates), Math.max(...rates));
  const capacity = normalize(s.dc_capacity_mw, Math.min(...caps), Math.max(...caps));
  const tier = tierScore(s.tier);

  return Math.round(
    (feasibility * weights.feasibility +
     rateCost * weights.rateCost +
     capacity * weights.capacity +
     tier * weights.tier) * 100
  );
}

// ─── Facility composite score ────────────────────────────────────────────────

export function scoreFacility(
  f: FacilityRecord,
  allFacilities: FacilityRecord[],
  weights = DEFAULT_FACILITY_WEIGHTS,
): number {
  const rates = allFacilities.map(x => x.est_rate_kwh);
  const pues = allFacilities.map(x => x.pue);
  const carbons = allFacilities.map(x => x.grid_carbon_lb_mwh);

  const feasibility = f.power_feasibility_score / 100;
  const rateCost = invertNormalize(f.est_rate_kwh, Math.min(...rates), Math.max(...rates));
  const pue = invertNormalize(f.pue, Math.min(...pues), Math.max(...pues));
  const renewable = f.renewable_energy_pct / 100;
  const tier = tierScore(f.tier_rating);
  const carbon = invertNormalize(f.grid_carbon_lb_mwh, Math.min(...carbons), Math.max(...carbons));

  return Math.round(
    (feasibility * weights.feasibility +
     rateCost * weights.rateCost +
     pue * weights.pue +
     renewable * weights.renewable +
     tier * weights.tier +
     carbon * weights.carbon) * 100
  );
}

// ─── Ranking builders ────────────────────────────────────────────────────────

export function rankStates(states: StateRecord[], by: keyof StateRecord | "composite" = "composite") {
  if (by === "composite") {
    return [...states].sort((a, b) => scoreState(b, states) - scoreState(a, states));
  }
  return [...states].sort((a, b) => {
    const va = Number(a[by]) ?? 0;
    const vb = Number(b[by]) ?? 0;
    return by === "industrial_rate_kwh" || by === "commercial_rate_kwh" ? va - vb : vb - va;
  });
}

export function rankFacilities(facilities: FacilityRecord[], by: keyof FacilityRecord | "composite" = "composite") {
  if (by === "composite") {
    return [...facilities].sort((a, b) => scoreFacility(b, facilities) - scoreFacility(a, facilities));
  }
  return [...facilities].sort((a, b) => {
    const va = Number(a[by]) ?? 0;
    const vb = Number(b[by]) ?? 0;
    if (by === "est_rate_kwh" || by === "pue" || by === "grid_carbon_lb_mwh") return va - vb;
    return vb - va;
  });
}

export function rankProviders(facilities: FacilityRecord[]) {
  const byProvider = new Map<string, FacilityRecord[]>();
  for (const f of facilities) {
    const list = byProvider.get(f.provider) ?? [];
    list.push(f);
    byProvider.set(f.provider, list);
  }

  return Array.from(byProvider.entries()).map(([provider, facs]) => ({
    provider,
    facilityCount: facs.length,
    avgFeasibility: Math.round(facs.reduce((s, f) => s + f.power_feasibility_score, 0) / facs.length),
    avgPue: +(facs.reduce((s, f) => s + f.pue, 0) / facs.length).toFixed(2),
    avgRenewable: +(facs.reduce((s, f) => s + f.renewable_energy_pct, 0) / facs.length).toFixed(1),
    avgRate: +(facs.reduce((s, f) => s + f.est_rate_kwh, 0) / facs.length).toFixed(2),
  })).sort((a, b) => b.avgFeasibility - a.avgFeasibility);
}
