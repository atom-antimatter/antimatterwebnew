-- ============================================================
-- Power & Energy layers — Supabase migration
-- Run via: supabase db push  OR  psql $DATABASE_URL < this file
-- ============================================================

-- PostGIS is required for geometry columns and spatial indexes.
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. Utility rates (OpenEI URDB) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS power_urdb_rates (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  utility_name            text NOT NULL,
  rate_name               text,
  sector                  text,          -- residential | commercial | industrial
  uri                     text,          -- OpenEI source URL
  lat                     numeric,
  lon                     numeric,
  geometry                geography(Point, 4326),
  json                    jsonb,         -- raw API response
  demand_charge_summary   jsonb,         -- {hasDemandCharge, maxDemandCharge, notes}
  energy_charge_summary   jsonb,         -- {minEnergyRate, maxEnergyRate, notes}
  tou_complexity          int DEFAULT 0, -- 0-10 heuristic
  updated_at              timestamptz DEFAULT now(),
  source                  text DEFAULT 'openei_urdb'
);

CREATE INDEX IF NOT EXISTS power_urdb_rates_geom_idx
  ON power_urdb_rates USING GIST (geometry);
CREATE INDEX IF NOT EXISTS power_urdb_rates_sector_idx
  ON power_urdb_rates (sector);

-- ── 2. Generation units (EIA-860) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS power_generation_units (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id      text NOT NULL,
  plant_name    text,
  operator      text,
  status        text,                    -- OP | SB | CN | etc.
  fuel_type     text,                    -- NG | NUC | WAT | SUN | WND | COL | GEO | etc.
  nameplate_mw  numeric,
  summer_mw     numeric,
  winter_mw     numeric,
  lat           numeric NOT NULL,
  lon           numeric NOT NULL,
  geometry      geography(Point, 4326),
  state         text,
  county        text,
  updated_at    timestamptz DEFAULT now(),
  source        text DEFAULT 'eia860',
  UNIQUE (plant_id, fuel_type)
);

CREATE INDEX IF NOT EXISTS power_gen_units_geom_idx
  ON power_generation_units USING GIST (geometry);
CREATE INDEX IF NOT EXISTS power_gen_units_state_idx
  ON power_generation_units (state);
CREATE INDEX IF NOT EXISTS power_gen_units_fuel_idx
  ON power_generation_units (fuel_type);

-- ── 3. Grid emissions intensity (EPA eGRID) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS power_grid_intensity (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code     text UNIQUE NOT NULL,  -- eGRID subregion e.g. CAMX, MROE
  region_name     text,
  co2_lb_per_mwh  numeric,
  so2_lb_per_mwh  numeric,
  nox_lb_per_mwh  numeric,
  year            int,
  geometry        geography(MultiPolygon, 4326),  -- if shapes available
  updated_at      timestamptz DEFAULT now(),
  source          text DEFAULT 'epa_egrid'
);

CREATE INDEX IF NOT EXISTS power_grid_intensity_geom_idx
  ON power_grid_intensity USING GIST (geometry);

-- ── 4. Interconnection queue ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS power_interconnection_queue (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iso              text NOT NULL,         -- MISO | PJM | NYISO | CAISO | ERCOT | SPP | ISONE
  queue_id         text,
  project_name     text,
  status           text,                  -- ACTIVE | WITHDRAWN | COMPLETED | etc.
  technology       text,                  -- Solar | Wind | Battery | Gas | etc.
  capacity_mw      numeric,
  in_service_date  date,
  county           text,
  state            text,
  lat              numeric,
  lon              numeric,
  geometry         geography(Point, 4326),
  raw              jsonb,
  updated_at       timestamptz DEFAULT now(),
  source           text NOT NULL,         -- 'miso' | 'pjm' | 'nyiso' | etc.
  UNIQUE (iso, queue_id)
);

CREATE INDEX IF NOT EXISTS power_queue_geom_idx
  ON power_interconnection_queue USING GIST (geometry);
CREATE INDEX IF NOT EXISTS power_queue_state_idx
  ON power_interconnection_queue (state);
CREATE INDEX IF NOT EXISTS power_queue_iso_idx
  ON power_interconnection_queue (iso);
CREATE INDEX IF NOT EXISTS power_queue_status_idx
  ON power_interconnection_queue (status);

-- ── 5. Feasibility score cache (viewport tile cache) ──────────────────────────
-- z/x/y follows the standard web-mercator tile scheme used by Cesium/OSM.
CREATE TABLE IF NOT EXISTS power_feasibility_cache (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  z            int  NOT NULL,
  x            int  NOT NULL,
  y            int  NOT NULL,
  bbox         jsonb NOT NULL,   -- {west, south, east, north} degrees
  score        int  NOT NULL,    -- 0-100
  signals      jsonb,            -- {rateIndex, genIndex, carbonIndex, queueIndex, weights}
  computed_at  timestamptz DEFAULT now(),
  UNIQUE (z, x, y)
);

CREATE INDEX IF NOT EXISTS power_feasibility_cache_zxy_idx
  ON power_feasibility_cache (z, x, y);

-- ── Helper function: lon/lat point to eGRID region ────────────────────────────
-- Falls back to state-level mapping when geometry is not loaded.
CREATE OR REPLACE FUNCTION get_egrid_region(p_lon numeric, p_lat numeric)
RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT region_code
  FROM   power_grid_intensity
  WHERE  geometry IS NOT NULL
    AND  ST_DWithin(geometry, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography, 0)
  LIMIT  1;
$$;

COMMENT ON TABLE power_urdb_rates IS
  'OpenEI Utility Rate Database rates. Electricity cost proxies — not a guarantee of available tariff. Source: https://openei.org/wiki/Utility_Rate_Database';

COMMENT ON TABLE power_generation_units IS
  'EIA Form 860 generator-level data. Source: https://www.eia.gov/electricity/data/eia860/';

COMMENT ON TABLE power_grid_intensity IS
  'EPA eGRID annual subregion emissions intensity. Source: https://www.epa.gov/egrid';

COMMENT ON TABLE power_interconnection_queue IS
  'ISO/RTO public interconnection queues. IMPORTANT: queued MW ≠ available capacity; this is a competition-for-interconnection proxy. Sources: MISO, PJM, NYISO (where open downloads exist).';

COMMENT ON TABLE power_feasibility_cache IS
  'Cached viewport-level power feasibility scores. Invalidated when underlying datasets are refreshed.';
