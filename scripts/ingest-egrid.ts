#!/usr/bin/env tsx
/**
 * ingest-egrid.ts — EPA eGRID subregion emissions intensity ingest
 *
 * Usage: pnpm ingest:egrid
 *
 * What this does:
 *  1. Loads the eGRID 2022 summary data (from embedded reference or downloaded Excel).
 *  2. Upserts CO2/SO2/NOx intensity factors into power_grid_intensity table.
 *
 * eGRID data is updated roughly every 2 years.
 * Download: https://www.epa.gov/egrid/download-data
 *
 * Attribution: U.S. EPA — Public Domain
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// eGRID 2022 subregion annual emissions (Table 2)
// Source: https://www.epa.gov/system/files/documents/2024-01/egrid2022_summary_tables.xlsx
const EGRID_2022: Array<{
  code: string; name: string; co2: number; so2: number; nox: number;
}> = [
  { code: "AKGD", name: "ASCC Alaska Grid",                     co2: 929,   so2: 0.26, nox: 1.61 },
  { code: "AKMS", name: "ASCC Miscellaneous",                   co2: 116,   so2: 0.02, nox: 0.23 },
  { code: "AZNM", name: "WECC Southwest",                       co2: 886,   so2: 0.37, nox: 0.55 },
  { code: "CAMX", name: "WECC California",                      co2: 519,   so2: 0.04, nox: 0.23 },
  { code: "ERCT", name: "ERCOT Texas",                          co2: 871,   so2: 0.42, nox: 0.65 },
  { code: "FRCC", name: "FRCC Florida",                         co2: 1010,  so2: 0.61, nox: 0.84 },
  { code: "HIMS", name: "HICC Miscellaneous",                   co2: 1607,  so2: 2.66, nox: 2.62 },
  { code: "HIOA", name: "HICC Oahu",                            co2: 1403,  so2: 1.35, nox: 1.42 },
  { code: "MROE", name: "MRO East",                             co2: 1020,  so2: 1.09, nox: 0.95 },
  { code: "MROW", name: "MRO West",                             co2: 978,   so2: 0.79, nox: 0.90 },
  { code: "NEWE", name: "NPCC New England",                     co2: 583,   so2: 0.08, nox: 0.23 },
  { code: "NWPP", name: "WECC Northwest",                       co2: 527,   so2: 0.11, nox: 0.38 },
  { code: "NYCW", name: "NPCC NYC/Westchester",                 co2: 585,   so2: 0.10, nox: 0.34 },
  { code: "NYUP", name: "NPCC Upstate NY",                      co2: 218,   so2: 0.17, nox: 0.20 },
  { code: "RFCE", name: "RFC East",                             co2: 869,   so2: 0.55, nox: 0.56 },
  { code: "RFCM", name: "RFC Michigan",                         co2: 1011,  so2: 1.09, nox: 0.79 },
  { code: "RFCW", name: "RFC West",                             co2: 1294,  so2: 1.67, nox: 0.97 },
  { code: "RMPA", name: "WECC Rockies",                         co2: 1211,  so2: 1.12, nox: 1.18 },
  { code: "SPNO", name: "SPP North",                            co2: 1057,  so2: 0.65, nox: 0.89 },
  { code: "SPSO", name: "SPP South",                            co2: 875,   so2: 0.62, nox: 0.70 },
  { code: "SRDA", name: "SERC Delta",                           co2: 1000,  so2: 0.77, nox: 0.82 },
  { code: "SRGW", name: "SERC Gateway",                         co2: 1479,  so2: 1.54, nox: 1.04 },
  { code: "SRSE", name: "SERC Southeast",                       co2: 852,   so2: 0.51, nox: 0.68 },
  { code: "SRSO", name: "SERC South",                           co2: 988,   so2: 0.90, nox: 0.80 },
  { code: "SRTV", name: "SERC Tennessee Valley",                co2: 697,   so2: 0.62, nox: 0.70 },
  { code: "SRVC", name: "SERC Virginia/Carolina",               co2: 783,   so2: 0.49, nox: 0.60 },
];

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  console.log(`Upserting ${EGRID_2022.length} eGRID 2022 subregions…`);

  const rows = EGRID_2022.map((r) => ({
    region_code:    r.code,
    region_name:    r.name,
    co2_lb_per_mwh: r.co2,
    so2_lb_per_mwh: r.so2,
    nox_lb_per_mwh: r.nox,
    year:           2022,
    source:         "epa_egrid",
  }));

  const { error } = await sb
    .from("power_grid_intensity")
    .upsert(rows, { onConflict: "region_code" });

  if (error) {
    console.error("Upsert error:", error.message);
    process.exit(1);
  }

  console.log(`Done. Inserted/updated ${rows.length} eGRID subregions.`);
  console.log("NOTE: Geometry shapes are not included in this ingest.");
  console.log("      Spatial queries will fall back to state-level lookup.");
}

main().catch(console.error);
