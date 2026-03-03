-- ============================================================
-- Provider regions table (Akamai/Linode, AWS, etc.)
-- Run via: supabase db push  OR  psql $DATABASE_URL < this file
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS provider_regions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider     text  NOT NULL,                  -- 'akamai_linode'
  region_id    text  NOT NULL,                  -- e.g. 'us-east'
  label        text,
  country      text,
  city         text,
  site_type    text,                            -- 'core' | 'distributed' | null
  lat          numeric,
  lon          numeric,
  geometry     geography(Point, 4326)
                 GENERATED ALWAYS AS (
                   CASE
                     WHEN lat IS NOT NULL AND lon IS NOT NULL
                     THEN ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
                     ELSE NULL
                   END
                 ) STORED,
  capabilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  availability jsonb,                           -- from /regions/availability
  status       text,                            -- 'active' | 'outage' | 'planned' | null
  source       jsonb,                           -- { api, fetchedAt }
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, region_id)
);

CREATE INDEX IF NOT EXISTS provider_regions_geometry_idx
  ON provider_regions USING GIST (geometry);
CREATE INDEX IF NOT EXISTS provider_regions_provider_idx
  ON provider_regions (provider);

COMMENT ON TABLE provider_regions IS
  'Cloud provider region footprint. Currently populated from Akamai/Linode API v4.';
COMMENT ON COLUMN provider_regions.geometry IS
  'Auto-computed PostGIS point from lat/lon. May be NULL if coordinates are unknown.';
COMMENT ON COLUMN provider_regions.availability IS
  'Raw availability payload from /regions/availability. Interpret with provider docs.';
