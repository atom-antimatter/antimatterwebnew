-- Migration: building density cache for 3D availability detection.
-- Run this in Supabase SQL editor.
--
-- Caches estimated building counts per quadkey so the 3D availability
-- check is instant on subsequent visits.

CREATE TABLE IF NOT EXISTS building_density_cache (
  quadkey        TEXT PRIMARY KEY,
  building_count INTEGER NOT NULL DEFAULT 0,
  last_checked   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS building_density_cache_count_idx
  ON building_density_cache (building_count);

COMMENT ON TABLE building_density_cache IS 'Cached building counts per quadkey for fast 3D availability detection';
