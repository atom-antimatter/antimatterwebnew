#!/usr/bin/env tsx
/**
 * ingest-urdb.ts — OpenEI Utility Rate Database ingest
 *
 * Usage: pnpm ingest:urdb
 *        OPENEI_API_KEY=<your_key> pnpm ingest:urdb
 *
 * Register for a free key at: https://openei.org/services/registration/
 *
 * What this does:
 *  1. Fetches commercial/industrial utility rates from URDB v3 API.
 *  2. Parses demand charge and energy charge structures into summaries.
 *  3. Computes a TOU complexity score (0-10).
 *  4. Upserts into Supabase power_urdb_rates table.
 *
 * Attribution: OpenEI, U.S. DOE — https://openei.org/wiki/Utility_Rate_Database
 * License: Public Domain / Open Data Commons PDDL
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENEI_KEY   = process.env.OPENEI_API_KEY ?? "DEMO_KEY";

const BASE_URL = "https://api.openei.org/utility_rates";
const SECTORS  = ["Commercial", "Industrial"] as const;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Rate parsing helpers ─────────────────────────────────────────────────────

function parseDemandCharge(rate: Record<string, unknown>) {
  const schedules = (rate.demandratestructure as unknown[][]) ?? [];
  const flatRates = schedules.flatMap((period) =>
    (period as Record<string, number>[]).map((t) => t.rate ?? 0).filter((r) => r > 0)
  );
  const hasDemandCharge = flatRates.length > 0;
  const maxDemandCharge = hasDemandCharge ? Math.max(...flatRates) : null;
  return {
    hasDemandCharge,
    maxDemandCharge,
    notes: hasDemandCharge
      ? `Max demand charge $${maxDemandCharge?.toFixed(2)}/kW — verify with utility`
      : "No demand charge detected in this rate",
  };
}

function parseEnergyCharge(rate: Record<string, unknown>) {
  const schedules = (rate.energyratestructure as unknown[][]) ?? [];
  const flatRates = schedules.flatMap((period) =>
    (period as Record<string, number>[]).map((t) => t.rate ?? 0).filter((r) => r > 0)
  );
  const minEnergyRate = flatRates.length > 0 ? Math.min(...flatRates) : null;
  const maxEnergyRate = flatRates.length > 0 ? Math.max(...flatRates) : null;
  return {
    minEnergyRate,
    maxEnergyRate,
    notes: `Range $${minEnergyRate?.toFixed(4)}–$${maxEnergyRate?.toFixed(4)}/kWh (EIA units; verify tariff)`,
  };
}

function touComplexity(rate: Record<string, unknown>): number {
  const periods = (rate.energyweekdayschedule as unknown[][] | undefined)?.length ?? 0;
  const seasons  = (rate.energyratestructure as unknown[][] | undefined)?.length ?? 0;
  return Math.min(10, Math.floor((periods + seasons) / 4));
}

// ── Fetch one page of rates ──────────────────────────────────────────────────

async function fetchRates(sector: string, offset: number, limit = 25) {
  const url = new URL(BASE_URL);
  url.searchParams.set("version", "3");
  url.searchParams.set("format", "json");
  url.searchParams.set("api_key", OPENEI_KEY);
  url.searchParams.set("sector", sector);
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("fields", [
    "label","utility","name","sector","uri","startdate",
    "demandratestructure","energyratestructure",
    "energyweekdayschedule","demandweekdayschedule",
  ].join(","));

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "AntimatterAI-Atlas-Ingest/1.0" },
  });
  if (!res.ok) throw new Error(`URDB API error: ${res.status}`);
  const json = await res.json();
  return json.items as Record<string, unknown>[];
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  console.log("Starting URDB ingest (commercial + industrial rates)…");
  let totalInserted = 0;

  for (const sector of SECTORS) {
    let offset = 0;
    const PAGE  = 25;
    let hasMore = true;

    while (hasMore) {
      await new Promise((r) => setTimeout(r, 1200)); // 1.2s between calls
      console.log(`  ${sector} — offset ${offset}…`);

      let items: Record<string, unknown>[] = [];
      try {
        items = await fetchRates(sector, offset, PAGE);
      } catch (e) {
        console.error(`  Error at offset ${offset}:`, e);
        break;
      }

      if (items.length === 0) { hasMore = false; break; }

      const rows = items.map((r) => ({
        utility_name: String(r.utility ?? ""),
        rate_name:    String(r.name ?? ""),
        sector,
        uri: String(r.uri ?? ""),
        json: r,
        demand_charge_summary: parseDemandCharge(r),
        energy_charge_summary: parseEnergyCharge(r),
        tou_complexity: touComplexity(r),
      }));

      const { error } = await sb.from("power_urdb_rates").upsert(rows, { onConflict: "uri" });
      if (error) console.error("  Upsert error:", error.message);
      else totalInserted += rows.length;

      offset += PAGE;
      if (items.length < PAGE) hasMore = false;

      // Safety cap: max 2,000 rates per sector for initial load
      if (offset >= 2000) hasMore = false;
    }
  }

  console.log(`Done. Inserted/updated ${totalInserted} rate records.`);
}

main().catch(console.error);
