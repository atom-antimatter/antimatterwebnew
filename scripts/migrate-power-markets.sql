-- Migration: Power market intelligence tables for Atlas.
-- Run in Supabase SQL editor.

-- ── State-level power market data ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS power_market_states (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state                      TEXT UNIQUE NOT NULL,
  commercial_rate_kwh        NUMERIC,
  industrial_rate_kwh        NUMERIC,
  power_feasibility_score    INT,
  dc_capacity_mw             NUMERIC,
  annual_consumption_twh     NUMERIC,
  key_markets                TEXT,
  tier                       TEXT,
  notes                      TEXT,
  estimated_monthly_cost_100kw NUMERIC,
  annual_cost_1mw            NUMERIC,
  source                     TEXT DEFAULT 'uploaded_dataset',
  last_updated               TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_json                   JSONB
);

CREATE INDEX IF NOT EXISTS idx_pms_state ON power_market_states (state);
CREATE INDEX IF NOT EXISTS idx_pms_feasibility ON power_market_states (power_feasibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_pms_industrial_rate ON power_market_states (industrial_rate_kwh);
CREATE INDEX IF NOT EXISTS idx_pms_commercial_rate ON power_market_states (commercial_rate_kwh);
CREATE INDEX IF NOT EXISTS idx_pms_tier ON power_market_states (tier);

COMMENT ON TABLE power_market_states IS 'State-level power market data for Atlas intelligence layer';

-- ── Facility-level power market data ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS power_market_facilities (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider                   TEXT NOT NULL,
  facility_name              TEXT NOT NULL,
  city                       TEXT,
  state                      TEXT,
  power_feasibility_score    INT,
  utility_rate               INT,
  queue_pressure             INT,
  generation                 INT,
  grid_carbon                INT,
  est_rate_kwh               NUMERIC,
  grid_carbon_lb_mwh         NUMERIC,
  tier_rating                TEXT,
  pue                        NUMERIC,
  renewable_energy_pct       NUMERIC,
  notes                      TEXT,
  monthly_cost_10kw          NUMERIC,
  monthly_cost_100kw         NUMERIC,
  annual_cost_1mw            NUMERIC,
  lat                        NUMERIC,
  lng                        NUMERIC,
  source                     TEXT DEFAULT 'uploaded_dataset',
  last_updated               TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_json                   JSONB,
  UNIQUE(provider, facility_name)
);

CREATE INDEX IF NOT EXISTS idx_pmf_state ON power_market_facilities (state);
CREATE INDEX IF NOT EXISTS idx_pmf_provider ON power_market_facilities (provider);
CREATE INDEX IF NOT EXISTS idx_pmf_feasibility ON power_market_facilities (power_feasibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_pmf_pue ON power_market_facilities (pue);
CREATE INDEX IF NOT EXISTS idx_pmf_renewable ON power_market_facilities (renewable_energy_pct DESC);
CREATE INDEX IF NOT EXISTS idx_pmf_tier ON power_market_facilities (tier_rating);
CREATE INDEX IF NOT EXISTS idx_pmf_rate ON power_market_facilities (est_rate_kwh);

COMMENT ON TABLE power_market_facilities IS 'Facility-level power market data for Atlas intelligence layer';
