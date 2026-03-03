#!/usr/bin/env tsx
/**
 * ingest-eia860.ts — EIA Form 860 generator data ingest
 *
 * Usage: pnpm ingest:eia860
 *
 * What this does:
 *  1. Downloads the EIA-860 ZIP from the public URL.
 *  2. Extracts the generator/plant worksheets (CSV/Excel).
 *  3. Parses plant_id, name, operator, fuel_type, capacity, lat/lon.
 *  4. Upserts into Supabase power_generation_units table.
 *
 * EIA-860 data is updated annually (usually released ~October for prior year).
 * Download URL pattern: https://www.eia.gov/electricity/data/eia860/
 *
 * Attribution: U.S. Energy Information Administration — Public Domain
 * License: https://www.eia.gov/about/copyrights_reuse.php
 *
 * NOTE: This script requires the XLSX package:
 *   npm install --legacy-peer-deps xlsx
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Most recent EIA-860 ZIP — update URL each year
const EIA_860_URL = "https://www.eia.gov/electricity/data/eia860/archive/xls/eia8602022.zip";
const DOWNLOAD_DIR = "/tmp/eia860";
const ZIP_PATH    = path.join(DOWNLOAD_DIR, "eia860.zip");

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Fuel type normalisation ───────────────────────────────────────────────────

function normalizeFuel(raw: string): string {
  const map: Record<string, string> = {
    "NG": "NG", "NUC": "NUC", "WAT": "WAT", "SUN": "SUN",
    "WND": "WND", "COL": "COL", "SUB": "SUB", "BIT": "COL",
    "GEO": "GEO", "DFO": "OIL", "JF": "OIL", "RFO": "OIL",
    "MWH": "BAT", "BA": "BAT",
    "LFG": "MSW", "OBG": "MSW", "OBS": "MSW",
    "WDS": "BIO", "AB": "BIO",
  };
  return map[raw?.toUpperCase()] ?? (raw?.toUpperCase() || "OTH");
}

// ── Download ──────────────────────────────────────────────────────────────────

async function downloadZip(): Promise<void> {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  if (fs.existsSync(ZIP_PATH)) {
    console.log("  ZIP already downloaded, skipping.");
    return;
  }
  console.log(`  Downloading EIA-860 from ${EIA_860_URL}…`);
  const res = await fetch(EIA_860_URL, { headers: { "User-Agent": "AntimatterAI-Atlas-Ingest/1.0" } });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  await pipeline(res.body as any, createWriteStream(ZIP_PATH));
  console.log("  Download complete.");
}

// ── Parse (requires 'xlsx' package) ──────────────────────────────────────────

async function parseAndUpsert(): Promise<void> {
  let XLSX: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    XLSX = await eval('import("xlsx")'); // dynamic to avoid TS error (optional dep)
  } catch {
    console.error(
      "  xlsx package not found. Install with:\n  npm install --legacy-peer-deps xlsx\n"
    );
    console.log("  FALLBACK: Loading static sample data instead.");
    await upsertStaticSample();
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AdmZip = (await eval('import("adm-zip")')).default;
  const zip = new AdmZip(ZIP_PATH);
  const entries = zip.getEntries();

  // Find generator worksheet (typically "3_1_Generator_Y2022.xlsx")
  const genEntry = entries.find((e: any) => e.entryName.includes("Generator") && !e.entryName.startsWith("__"));
  if (!genEntry) {
    console.error("  Generator worksheet not found in ZIP.");
    return;
  }

  const buffer = genEntry.getData();
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: null, raw: false });

  console.log(`  Parsed ${rows.length} generator rows.`);

  const batch: Record<string, unknown>[] = [];
  for (const row of rows) {
    const plantId  = String(row["Plant Code"] ?? row["PLANT CODE"] ?? "");
    const plantName= String(row["Plant Name"] ?? row["PLANT NAME"] ?? "");
    const operator = String(row["Utility Name"] ?? "");
    const status   = String(row["Status"] ?? "OP");
    const fuelRaw  = String(row["Energy Source 1"] ?? row["Fuel Type Code"] ?? "");
    const fuel     = normalizeFuel(fuelRaw);
    const nameplateMw = parseFloat(String(row["Nameplate Capacity (MW)"] ?? "0")) || 0;
    const summerMw    = parseFloat(String(row["Summer Capacity (MW)"] ?? "0")) || null;
    const winterMw    = parseFloat(String(row["Winter Capacity (MW)"] ?? "0")) || null;
    const lat = parseFloat(String(row["Latitude"] ?? "0")) || null;
    const lon = parseFloat(String(row["Longitude"] ?? "0")) || null;
    const state  = String(row["State"] ?? "");
    const county = String(row["County"] ?? "");

    if (!plantId || !lat || !lon || nameplateMw <= 0) continue;
    if (status === "CN" || status === "IP" || status === "L") continue; // canceled/decommissioned

    batch.push({
      plant_id: plantId,
      plant_name: plantName,
      operator,
      status,
      fuel_type: fuel,
      nameplate_mw: nameplateMw,
      summer_mw: summerMw,
      winter_mw: winterMw,
      lat,
      lon,
      state,
      county,
    });

    if (batch.length >= 500) {
      await flushBatch(batch.splice(0));
    }
  }
  if (batch.length > 0) await flushBatch(batch);
}

async function flushBatch(rows: Record<string, unknown>[]) {
  const { error } = await sb
    .from("power_generation_units")
    .upsert(rows as any, { onConflict: "plant_id,fuel_type" });
  if (error) console.error("  Upsert error:", error.message);
  else console.log(`  Upserted ${rows.length} generator units.`);
}

// Static fallback: insert top-60 plants from our static reference data
async function upsertStaticSample() {
  const { STATIC_LARGE_PLANTS } = await import("../src/lib/power/staticReferenceData");
  const rows = STATIC_LARGE_PLANTS.map((p) => ({
    plant_id: p.id,
    plant_name: p.name,
    operator: p.operator,
    status: "OP",
    fuel_type: p.fuelType,
    nameplate_mw: p.capacityMw,
    lat: p.lat,
    lon: p.lng,
    state: p.state,
  }));
  const { error } = await sb.from("power_generation_units").upsert(rows, { onConflict: "plant_id,fuel_type" });
  if (error) console.error("  Static upsert error:", error.message);
  else console.log(`  Inserted ${rows.length} static large plants.`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  console.log("Starting EIA-860 ingest…");
  try {
    await downloadZip();
    await parseAndUpsert();
  } catch (e) {
    console.error("EIA-860 ingest failed:", e);
    console.log("Falling back to static sample data…");
    await upsertStaticSample();
  }
  console.log("EIA-860 ingest complete.");
}

main().catch(console.error);
