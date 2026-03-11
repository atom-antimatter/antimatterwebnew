/**
 * importPowerStates.ts — Upserts state-level power market data into Supabase.
 * Run: pnpm import:power-states
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

type RawState = {
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

async function main() {
  const filePath = resolve(__dirname, "../../data/power/complete.json");
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));
  const states: RawState[] = raw.states;

  console.log(`[import] Found ${states.length} states to upsert`);

  let inserted = 0;
  let errors = 0;

  for (const s of states) {
    const body = {
      state: s.state,
      commercial_rate_kwh: s.commercial_rate_kwh,
      industrial_rate_kwh: s.industrial_rate_kwh,
      power_feasibility_score: s.power_feasibility_score,
      dc_capacity_mw: s.dc_capacity_mw,
      annual_consumption_twh: s.annual_consumption_twh,
      key_markets: s.key_markets,
      tier: s.tier,
      notes: s.notes,
      estimated_monthly_cost_100kw: s.estimated_monthly_cost_100kw,
      annual_cost_1mw: s.annual_cost_1mw,
      source: "uploaded_dataset",
      last_updated: new Date().toISOString(),
      raw_json: s,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/power_market_states`, {
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
    else { errors++; console.warn(`[import] Failed: ${s.state} — ${res.status}`); }
  }

  console.log(`[import] Done: ${inserted} inserted/updated, ${errors} errors`);
}

main().catch(e => { console.error(e); process.exit(1); });
