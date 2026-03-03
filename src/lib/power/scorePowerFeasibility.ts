/**
 * scorePowerFeasibility.ts
 *
 * Deterministic Power Feasibility scoring model.
 *
 * IMPORTANT CAVEATS (surfaced to users via the `caveats` field):
 * - This is a FEASIBILITY SIGNAL PROXY, not engineering advice.
 * - Rate data is from URDB averages or state-level EIA estimates.
 * - Queue pressure = competing MW in queue, NOT available capacity.
 * - Generation proximity ≠ available interconnection capacity.
 * - eGRID carbon intensity is annual average; actual real-time mix varies.
 */

import {
  EGRID_CO2_BY_STATE,
  EIA_INDUSTRIAL_RATE_BY_STATE,
  QUEUE_MW_BY_STATE,
  STATIC_LARGE_PLANTS,
  latLonToState,
  type StaticPlant,
} from "./staticReferenceData";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SignalBreakdown = {
  /** 0-100 — electricity cost index (higher = cheaper) */
  rateIndex: number | null;
  /** 0-100 — nearby generation capacity index */
  genIndex: number | null;
  /** 0-100 — grid carbon intensity score (higher = cleaner) */
  carbonIndex: number | null;
  /** 0-100 — interconnection queue pressure (higher = less congested) */
  queueIndex: number | null;
};

export type NearbyPlant = StaticPlant & { distanceKm: number };

export type NearbyQueueProject = {
  iso: string;
  queueId: string;
  name: string;
  capacityMw: number;
  technology: string;
  status: string;
  state: string;
};

export type PowerFeasibilityResult = {
  score: number;              // 0-100 weighted composite
  signals: SignalBreakdown;
  weights: Record<string, number>;
  state: string | null;
  nearbyPlants: NearbyPlant[];
  nearbyQueueProjects: NearbyQueueProject[];
  rateProxy: {
    ratePerKwh: number | null;
    source: "static_eia" | "urdb" | "unknown";
    notes: string;
  };
  carbonProxy: {
    co2LbPerMwh: number | null;
    subregion: string | null;
    source: "static_egrid" | "db" | "unknown";
  };
  queueProxy: {
    queuedMw: number | null;
    projectCount: number;
    iso: string | null;
    source: "static_summary" | "db" | "unknown";
  };
  caveats: string[];
  attribution: string[];
};

export type ScoringOptions = {
  radiusKm?: number;   // search radius for nearby plants (default 80 km)
  targetMw?: number;   // target load scenario in MW (default 100)
  /** Override default signal weights (must sum to 1.0) */
  weights?: {
    rateIndex?: number;
    genIndex?: number;
    carbonIndex?: number;
    queueIndex?: number;
  };
};

// ─── Default weights ──────────────────────────────────────────────────────────
// Configurable here in one place; users can override via ScoringOptions.weights.
const DEFAULT_WEIGHTS = {
  rateIndex:   0.35,
  queueIndex:  0.35,
  genIndex:    0.20,
  carbonIndex: 0.10,
};

// ─── Haversine distance ───────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// ─── Signal scorers ───────────────────────────────────────────────────────────

/**
 * rateIndex — higher score = cheaper electricity.
 * Normalization:
 *   $0.045/kWh → 100  (excellent: WA/ID hydro-heavy)
 *   $0.075/kWh →  70  (good: national average for industrial)
 *   $0.120/kWh →  40  (below average: New England)
 *   $0.200/kWh →   0  (poor: CA, HI)
 */
function scoreRate(ratePerKwh: number): number {
  const score = 100 - ((ratePerKwh - 0.045) / (0.200 - 0.045)) * 100;
  return clamp(Math.round(score), 0, 100);
}

/**
 * carbonIndex — higher score = cleaner grid.
 * Normalization based on eGRID 2022 range (24 VT to ~1,900 WV lb/MWh):
 *   24 lb/MWh  → 100  (VT: almost pure hydro/wind)
 *  400 lb/MWh  →  80
 *  800 lb/MWh  →  55
 * 1200 lb/MWh  →  25
 * 1900 lb/MWh  →   0
 */
function scoreCo2(co2LbPerMwh: number): number {
  const score = 100 - ((co2LbPerMwh - 24) / (1900 - 24)) * 100;
  return clamp(Math.round(score), 0, 100);
}

/**
 * genIndex — higher score = more nearby reliable generation capacity.
 * Takes into account:
 *  - Total MW within radius
 *  - Fuel-type reliability weights (nuclear/hydro best, intermittent lower)
 *  - Number of distinct plants (diversity bonus)
 */
const FUEL_RELIABILITY: Record<string, number> = {
  NUC: 1.0,   // Nuclear — highest CF
  WAT: 0.90,  // Hydro
  NG:  0.85,  // Gas CCGT
  GEO: 0.85,  // Geothermal
  BAT: 0.70,  // Battery storage (dispatchable but finite duration)
  COL: 0.75,  // Coal
  SUB: 0.75,  // Sub-bituminous coal
  WND: 0.35,  // Wind (variable)
  SUN: 0.25,  // Solar (variable)
  OIL: 0.70,  // Oil peakers
  MSW: 0.80,  // Waste-to-energy
};

function scoreGeneration(plants: NearbyPlant[], targetMw: number): number {
  if (plants.length === 0) return 0;

  const reliableMw = plants.reduce((sum, p) => {
    const rel = FUEL_RELIABILITY[p.fuelType] ?? 0.5;
    return sum + p.capacityMw * rel;
  }, 0);

  // Normalized against target MW (1x target MW nearby = score 50; 3x = score 80; 10x = 100)
  const ratio = reliableMw / Math.max(targetMw, 1);
  let score = 0;
  if      (ratio >= 10) score = 100;
  else if (ratio >=  5) score = 90;
  else if (ratio >=  3) score = 80;
  else if (ratio >=  2) score = 70;
  else if (ratio >=  1) score = 55;
  else if (ratio >= 0.5) score = 35;
  else                   score = 15;

  // Diversity bonus: more than 5 plants with different fuels = +5
  const fuels = new Set(plants.map((p) => p.fuelType));
  if (fuels.size >= 4) score = Math.min(100, score + 5);

  return score;
}

/**
 * queueIndex — higher score = lower interconnection pressure.
 * A market with enormous queued MW faces:
 *   - Longer interconnection timelines
 *   - More network upgrade uncertainty
 *   - Higher cost allocation risk
 *
 * Note: These thresholds are approximate national context from 2024 queue data.
 */
function scoreQueue(queuedMw: number): number {
  if (queuedMw <=  2_000) return 95;
  if (queuedMw <=  5_000) return 85;
  if (queuedMw <= 10_000) return 72;
  if (queuedMw <= 15_000) return 58;
  if (queuedMw <= 25_000) return 42;
  if (queuedMw <= 40_000) return 28;
  if (queuedMw <= 60_000) return 15;
  return 5; // TX ERCOT (78,000+ MW queued as of 2024)
}

// ─── Weighted composite ───────────────────────────────────────────────────────

function weightedScore(signals: SignalBreakdown, requestedWeights: typeof DEFAULT_WEIGHTS): {
  score: number;
  actualWeights: typeof DEFAULT_WEIGHTS;
} {
  const pairs: Array<[keyof SignalBreakdown, number]> = [
    ["rateIndex",   requestedWeights.rateIndex],
    ["genIndex",    requestedWeights.genIndex],
    ["carbonIndex", requestedWeights.carbonIndex],
    ["queueIndex",  requestedWeights.queueIndex],
  ];

  // Only include signals that have data
  const available = pairs.filter(([key]) => signals[key] !== null);
  if (available.length === 0) return { score: 50, actualWeights: requestedWeights };

  const totalWeight = available.reduce((s, [, w]) => s + w, 0);
  const composite = available.reduce((s, [key, w]) => s + (signals[key] as number) * (w / totalWeight), 0);

  return {
    score: clamp(Math.round(composite), 0, 100),
    actualWeights: {
      rateIndex:   (signals.rateIndex   !== null ? requestedWeights.rateIndex   / totalWeight : 0),
      genIndex:    (signals.genIndex    !== null ? requestedWeights.genIndex    / totalWeight : 0),
      carbonIndex: (signals.carbonIndex !== null ? requestedWeights.carbonIndex / totalWeight : 0),
      queueIndex:  (signals.queueIndex  !== null ? requestedWeights.queueIndex  / totalWeight : 0),
    },
  };
}

// ─── Main scorer ─────────────────────────────────────────────────────────────

/**
 * Compute a Power Feasibility Score for a lat/lon location.
 *
 * Works with static reference data only (no DB calls here).
 * The API route layer handles optional Supabase enrichment.
 */
export function scorePowerFeasibility(
  lat: number,
  lng: number,
  opts: ScoringOptions = {}
): PowerFeasibilityResult {
  const radiusKm = opts.radiusKm ?? 80;
  const targetMw = opts.targetMw ?? 100;
  const requestedWeights = { ...DEFAULT_WEIGHTS, ...opts.weights };

  const caveats: string[] = [];
  const attribution: string[] = [
    "Electricity rates: EIA Electric Power Monthly (2023 annual average by state)",
    "Carbon intensity: EPA eGRID 2022 annual subregion averages",
    "Generation data: EIA-860 (2022) — top plants by capacity",
    "Queue pressure: MISO/PJM/CAISO/ERCOT public queue publications (2024 Q1 summary)",
  ];

  // ── 1. State lookup ─────────────────────────────────────────────────────────
  const state = latLonToState(lat, lng);
  const isUS = state !== null;

  if (!isUS) {
    caveats.push(
      "Location is outside the US or could not be mapped to a state. Rate and queue signals unavailable; using carbon estimate only."
    );
  }

  // ── 2. Rate signal ──────────────────────────────────────────────────────────
  let rateIndex: number | null = null;
  let ratePerKwh: number | null = null;
  let rateSource: "static_eia" | "urdb" | "unknown" = "unknown";
  let rateNotes = "";

  if (state && EIA_INDUSTRIAL_RATE_BY_STATE[state]) {
    ratePerKwh = EIA_INDUSTRIAL_RATE_BY_STATE[state];
    rateIndex = scoreRate(ratePerKwh);
    rateSource = "static_eia";
    rateNotes = `State average $/kWh from EIA 2023. Actual negotiated rates for large loads may differ significantly; request utility tariff schedules for accurate analysis.`;
    caveats.push("Utility rate is a state-level average proxy. Consult actual utility tariffs for site-specific pricing.");
  } else {
    caveats.push("Electricity rate data unavailable for this location.");
  }

  // ── 3. Carbon signal ────────────────────────────────────────────────────────
  let carbonIndex: number | null = null;
  let co2LbPerMwh: number | null = null;
  let carbonSubregion: string | null = null;
  let carbonSource: "static_egrid" | "db" | "unknown" = "unknown";

  if (state && EGRID_CO2_BY_STATE[state]) {
    co2LbPerMwh = EGRID_CO2_BY_STATE[state];
    carbonIndex = scoreCo2(co2LbPerMwh);
    carbonSource = "static_egrid";
    carbonSubregion = state;
    caveats.push("Carbon intensity is EPA eGRID 2022 annual average; actual real-time marginal intensity varies by hour.");
  } else {
    // Very rough global estimate fallback: ~700 lb/MWh world average
    co2LbPerMwh = 700;
    carbonIndex = scoreCo2(700);
    carbonSource = "static_egrid";
    caveats.push("Carbon intensity estimated from global average (~700 lb/MWh). EPA eGRID data covers US only.");
  }

  // ── 4. Generation signal ────────────────────────────────────────────────────
  const nearbyPlants: NearbyPlant[] = STATIC_LARGE_PLANTS
    .map((p) => ({ ...p, distanceKm: haversineKm(lat, lng, p.lat, p.lng) }))
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 20); // cap at 20 for display

  let genIndex: number | null = null;
  if (nearbyPlants.length > 0 || isUS) {
    // Even with no static plants visible, state has generation context
    genIndex = scoreGeneration(nearbyPlants, targetMw);
    if (nearbyPlants.length === 0) {
      caveats.push(
        `No major generation units found within ${radiusKm} km in static dataset. EIA-860 full ingest would reveal additional plants.`
      );
    }
    caveats.push("Generation proximity is a reliability diversity proxy. Ingest full EIA-860 for comprehensive analysis.");
  }

  // ── 5. Queue signal ─────────────────────────────────────────────────────────
  let queueIndex: number | null = null;
  let queuedMw: number | null = null;
  const nearbyQueueProjects: NearbyQueueProject[] = [];
  let queueIso: string | null = null;
  let queueSource: "static_summary" | "db" | "unknown" = "unknown";

  if (state && QUEUE_MW_BY_STATE[state]) {
    queuedMw = QUEUE_MW_BY_STATE[state];
    queueIndex = scoreQueue(queuedMw);
    queueSource = "static_summary";
    queueIso = getApproxIso(state);
    caveats.push(
      "Queue pressure is a state-level aggregate MW proxy from 2024 Q1 public queue publications. " +
      "Individual project data requires running the MISO/PJM queue ingest."
    );
  } else {
    caveats.push("Interconnection queue data unavailable for this location.");
  }

  // ── 6. Composite score ──────────────────────────────────────────────────────
  const signals: SignalBreakdown = { rateIndex, genIndex, carbonIndex, queueIndex };
  const { score, actualWeights } = weightedScore(signals, requestedWeights);

  return {
    score,
    signals,
    weights: actualWeights,
    state,
    nearbyPlants: nearbyPlants.slice(0, 5), // top 5 for display
    nearbyQueueProjects,
    rateProxy: { ratePerKwh, source: rateSource, notes: rateNotes },
    carbonProxy: { co2LbPerMwh, subregion: carbonSubregion, source: carbonSource },
    queueProxy: { queuedMw, projectCount: 0, iso: queueIso, source: queueSource },
    caveats,
    attribution,
  };
}

/** Approximate ISO/RTO for a US state */
function getApproxIso(state: string): string {
  const TX_ERCOT = ["TX"];
  const MISO     = ["MN","IA","IL","WI","IN","MI","ND","SD","NE","MO","LA","MS","AR","MT"];
  const PJM      = ["OH","PA","NJ","DE","MD","DC","VA","WV","KY","IN","IL","NC"];
  const CAISO    = ["CA"];
  const SPP      = ["KS","OK","SD","NE"];
  const NYISO    = ["NY"];
  const NEISO    = ["MA","CT","RI","NH","VT","ME"];
  const MAPP     = ["ND","SD","MN","WI"];

  if (TX_ERCOT.includes(state)) return "ERCOT";
  if (MISO.includes(state))     return "MISO";
  if (PJM.includes(state))      return "PJM";
  if (CAISO.includes(state))    return "CAISO";
  if (SPP.includes(state))      return "SPP";
  if (NYISO.includes(state))    return "NYISO";
  if (NEISO.includes(state))    return "ISO-NE";
  if (MAPP.includes(state))     return "MAPP";
  return "IOU/MUNI";
}

/** Score colour band */
export function scoreBand(score: number): "excellent" | "good" | "moderate" | "challenging" | "poor" {
  if (score >= 80) return "excellent";
  if (score >= 65) return "good";
  if (score >= 50) return "moderate";
  if (score >= 35) return "challenging";
  return "poor";
}

/** Score to hex colour for heatmap rendering */
export function scoreToCesiumColor(score: number): { r: number; g: number; b: number; a: number } {
  // Dark-theme friendly gradient:
  //   0  → deep red    rgb(180,  40,  40)
  //  50  → amber       rgb(180, 140,  20)
  // 100  → bright cyan rgb( 60, 200, 180)
  const t = score / 100;
  const r = Math.round(180 - t * 120);
  const g = Math.round(40  + t * 160);
  const b = Math.round(40  + t * 140);
  const a = 0.35; // semi-transparent overlay
  return { r: r / 255, g: g / 255, b: b / 255, a };
}
