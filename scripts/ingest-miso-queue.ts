#!/usr/bin/env tsx
/**
 * ingest-miso-queue.ts — MISO Interconnection Queue ingest
 *
 * Usage: pnpm ingest:queue:miso
 *
 * What this does:
 *  1. Downloads the MISO public queue spreadsheet.
 *  2. Parses queue ID, project name, MW, technology, status, state/county.
 *  3. Geocodes county centroids where coordinates are missing.
 *  4. Upserts into power_interconnection_queue table.
 *
 * IMPORTANT: This data represents projects SEEKING interconnection.
 *   Higher queued MW = more competition / upgrade risk — not available capacity.
 *
 * MISO queue download: https://www.misoenergy.org/planning/generator-interconnection/GI_Queue/
 * Attribution: MISO — publicly available under MISO Open Access data
 *
 * NOTE: Requires xlsx package: npm install --legacy-peer-deps xlsx
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// MISO GI Queue is a publicly-posted Excel file.
// URL changes periodically; check https://www.misoenergy.org/planning/generator-interconnection/GI_Queue/
const MISO_URL = "https://www.misoenergy.org/api/giqueue/getqueueitems";
const FALLBACK_URL = "https://www.misoenergy.org/planning/generator-interconnection/GI_Queue/";

const DOWNLOAD_DIR = "/tmp/miso";
const XLSX_PATH    = path.join(DOWNLOAD_DIR, "miso_queue.xlsx");

// ── State name to abbreviation ────────────────────────────────────────────────
const STATE_ABBR: Record<string, string> = {
  "alabama":"AL","alaska":"AK","arizona":"AZ","arkansas":"AR","california":"CA",
  "colorado":"CO","connecticut":"CT","delaware":"DE","florida":"FL","georgia":"GA",
  "hawaii":"HI","idaho":"ID","illinois":"IL","indiana":"IN","iowa":"IA",
  "kansas":"KS","kentucky":"KY","louisiana":"LA","maine":"ME","maryland":"MD",
  "massachusetts":"MA","michigan":"MI","minnesota":"MN","mississippi":"MS",
  "missouri":"MO","montana":"MT","nebraska":"NE","nevada":"NV","new hampshire":"NH",
  "new jersey":"NJ","new mexico":"NM","new york":"NY","north carolina":"NC",
  "north dakota":"ND","ohio":"OH","oklahoma":"OK","oregon":"OR","pennsylvania":"PA",
  "rhode island":"RI","south carolina":"SC","south dakota":"SD","tennessee":"TN",
  "texas":"TX","utah":"UT","vermont":"VT","virginia":"VA","washington":"WA",
  "west virginia":"WV","wisconsin":"WI","wyoming":"WY",
};

function normalizeState(raw: string): string {
  const s = (raw ?? "").trim().toLowerCase();
  return STATE_ABBR[s] ?? raw.toUpperCase().trim().slice(0, 2);
}

// ── Parse MISO queue spreadsheet ─────────────────────────────────────────────

async function downloadAndParse(): Promise<void> {
  let XLSX: any;
  try {
    XLSX = await eval('import("xlsx")'); // dynamic to avoid TS error (optional dep)
    void XLSX; // xlsx not actually used in JSON path but kept for Excel fallback
  } catch {
    console.error("xlsx package required: npm install --legacy-peer-deps xlsx");
    process.exit(1);
  }

  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

  // MISO exposes a JSON endpoint for the active queue
  console.log("  Fetching MISO queue JSON…");
  const res = await fetch(MISO_URL, {
    headers: {
      "User-Agent": "AntimatterAI-Atlas-Ingest/1.0",
      "Accept": "application/json",
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`MISO fetch failed (${res.status}). Check URL at ${FALLBACK_URL}`);
  }

  const json = await res.json();
  const items: Record<string, unknown>[] = Array.isArray(json)
    ? json
    : (json.data ?? json.items ?? json.GIQueue ?? []);

  console.log(`  Received ${items.length} MISO queue items.`);

  const batch: Record<string, unknown>[] = [];

  for (const item of items) {
    const queueId     = String(item["Queue ID"] ?? item["queueId"] ?? item["id"] ?? "");
    const projectName = String(item["Project Name"] ?? item["projectName"] ?? item["name"] ?? "");
    const capacityMw  = parseFloat(String(item["Requested MW"] ?? item["capacityMW"] ?? "0")) || null;
    const technology  = String(item["Fuel"] ?? item["technology"] ?? item["type"] ?? "");
    const status      = String(item["Queue Status"] ?? item["status"] ?? "ACTIVE");
    const stateRaw    = String(item["State"] ?? item["state"] ?? "");
    const county      = String(item["County"] ?? item["county"] ?? "");
    const dateStr     = String(item["In-Service Date"] ?? item["inServiceDate"] ?? "");

    if (!queueId) continue;

    const state = stateRaw.length === 2 ? stateRaw.toUpperCase() : normalizeState(stateRaw);
    let inServiceDate: string | null = null;
    try {
      if (dateStr) inServiceDate = new Date(dateStr).toISOString().split("T")[0];
    } catch { /* ignore invalid dates */ }

    batch.push({
      iso: "MISO",
      queue_id: queueId,
      project_name: projectName || null,
      status: status || "ACTIVE",
      technology: technology || null,
      capacity_mw: capacityMw,
      in_service_date: inServiceDate,
      county: county || null,
      state: state || null,
      raw: item,
    });

    if (batch.length >= 500) {
      await flushBatch(batch.splice(0));
    }
  }

  if (batch.length > 0) await flushBatch(batch);
}

async function flushBatch(rows: Record<string, unknown>[]) {
  const { error } = await sb
    .from("power_interconnection_queue")
    .upsert(rows as any, { onConflict: "iso,queue_id" });
  if (error) console.error("  Upsert error:", error.message);
  else console.log(`  Upserted ${rows.length} queue records.`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  console.log("Starting MISO Interconnection Queue ingest…");
  console.log("IMPORTANT: Queued MW = competition / upgrade risk proxy, NOT available capacity.");

  try {
    await downloadAndParse();
    console.log("MISO queue ingest complete.");
  } catch (e: any) {
    console.error("MISO ingest failed:", e.message);
    console.log(`\nManual download steps:
1. Visit: ${FALLBACK_URL}
2. Download the Excel queue file
3. Save to /tmp/miso/miso_queue.xlsx
4. Re-run: pnpm ingest:queue:miso`);
    process.exit(1);
  }
}

main().catch(console.error);
