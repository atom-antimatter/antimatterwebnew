-- Migration: building tile cache for Microsoft Global Building Footprints.
-- Run this in Supabase SQL editor.
--
-- Caches fetched building data by quadkey so frequently viewed cities
-- load instantly on subsequent visits.

CREATE TABLE IF NOT EXISTS building_tiles (
  quadkey      TEXT PRIMARY KEY,
  geojson      JSONB NOT NULL,
  bbox_west    DOUBLE PRECISION,
  bbox_south   DOUBLE PRECISION,
  bbox_east    DOUBLE PRECISION,
  bbox_north   DOUBLE PRECISION,
  building_count INTEGER NOT NULL DEFAULT 0,
  byte_size    INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS building_tiles_updated_idx ON building_tiles (last_updated);

COMMENT ON TABLE building_tiles IS 'Cache for Microsoft Global Building Footprints tiles, keyed by quadkey';
