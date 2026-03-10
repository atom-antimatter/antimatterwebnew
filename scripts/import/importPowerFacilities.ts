/**
 * importPowerFacilities.ts — Upserts facility-level power market data into Supabase.
 * Run: pnpm import:power-facilities
 */
import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Approximate city centroids for geocoding — extend as needed
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Las Vegas,Nevada": { lat: 36.17, lng: -115.14 },
  "Phoenix,Arizona": { lat: 33.45, lng: -112.07 },
  "Dallas,Texas": { lat: 32.78, lng: -96.80 },
  "San Antonio,Texas": { lat: 29.42, lng: -98.49 },
  "Quincy,Washington": { lat: 47.23, lng: -119.85 },
  "Portland,Oregon": { lat: 45.52, lng: -122.68 },
  "Chicago,Illinois": { lat: 41.88, lng: -87.63 },
  "Ashburn,Virginia": { lat: 39.04, lng: -77.49 },
  "Manassas,Virginia": { lat: 38.75, lng: -77.47 },
  "Sterling,Virginia": { lat: 39.01, lng: -77.43 },
  "Reston,Virginia": { lat: 38.97, lng: -77.34 },
  "Santa Clara,California": { lat: 37.35, lng: -121.95 },
  "Hillsboro,Oregon": { lat: 45.52, lng: -122.99 },
  "Salt Lake City,Utah": { lat: 40.76, lng: -111.89 },
  "Atlanta,Georgia": { lat: 33.75, lng: -84.39 },
  "Denver,Colorado": { lat: 39.74, lng: -104.99 },
  "Columbus,Ohio": { lat: 39.96, lng: -82.99 },
  "Minneapolis,Minnesota": { lat: 44.98, lng: -93.27 },
  "Charlotte,North Carolina": { lat: 35.23, lng: -80.84 },
  "Council Bluffs,Iowa": { lat: 41.26, lng: -95.86 },
  "Elk Grove Village,Illinois": { lat: 42.00, lng: -87.97 },
  "New Albany,Ohio": { lat: 40.08, lng: -82.81 },
  "Cheyenne,Wyoming": { lat: 41.14, lng: -104.82 },
  "Prineville,Oregon": { lat: 44.30, lng: -120.73 },
  "Papillion,Nebraska": { lat: 41.15, lng: -96.04 },
  "Maiden,North Carolina": { lat: 35.58, lng: -81.21 },
  "Mesa,Arizona": { lat: 33.42, lng: -111.83 },
};

type RawFacility = {
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
};

async function main() {
  const filePath = resolve(__dirname, "../../data/power/complete.json");
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));
  const facilities: RawFacility[] = raw.facilities;

  console.log(`[import] Found ${facilities.length} facilities to upsert`);

  let inserted = 0;
  let errors = 0;
  let noGeocode = 0;

  for (const f of facilities) {
    const key = `${f.city},${f.state}`;
    const coords = CITY_COORDS[key];
    if (!coords) { noGeocode++; console.warn(`[import] No geocode for: ${key}`); }

    const body = {
      provider: f.provider,
      facility_name: f.facility_name,
      city: f.city,
      state: f.state,
      power_feasibility_score: f.power_feasibility_score,
      utility_rate: f.utility_rate,
      queue_pressure: f.queue_pressure,
      generation: f.generation,
      grid_carbon: f.grid_carbon,
      est_rate_kwh: f.est_rate_kwh,
      grid_carbon_lb_mwh: f.grid_carbon_lb_mwh,
      tier_rating: f.tier_rating,
      pue: f.pue,
      renewable_energy_pct: f.renewable_energy_pct,
      notes: f.notes,
      monthly_cost_10kw: f.monthly_cost_10kw,
      monthly_cost_100kw: f.monthly_cost_100kw,
      annual_cost_1mw: f.annual_cost_1mw,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      source: "uploaded_dataset",
      last_updated: new Date().toISOString(),
      raw_json: f,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/power_market_facilities`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY!,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) { inserted++; }
    else { errors++; console.warn(`[import] Failed: ${f.facility_name} — ${res.status}`); }
  }

  console.log(`[import] Done: ${inserted} inserted/updated, ${errors} errors, ${noGeocode} missing geocodes`);
}

main().catch(e => { console.error(e); process.exit(1); });
