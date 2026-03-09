/**
 * baseMaps.ts — centralised basemap configuration.
 *
 * Single source of truth for tile URLs, quality tiers, retina support,
 * and max zoom levels. Used by AtlasMap, LayersMenu, and the debug overlay.
 */

export type RasterBasemapId = "osmDark" | "osmLight" | "osmStandard";
export type VectorBasemapId = "vectorDark" | "vectorLight" | "vectorLiberty";
export type BasemapId = RasterBasemapId | VectorBasemapId;

export type BasemapConfig = {
  id: BasemapId;
  label: string;
  helper: string;
  type: "raster" | "vector";
  maximumLevel: number;
  minimumLevel: number;
  credit: string;
  qualityTier: "vector" | "high" | "medium" | "fallback";
  // Raster-only fields (undefined for vector)
  urlTemplate?: string;
  retinaTemplate?: string | null;
  tileWidth?: number;
  tileHeight?: number;
  retinaTileWidth?: number;
  retinaTileHeight?: number;
  supportsRetina?: boolean;
  subdomains?: string[];
};

export const BASEMAP_CONFIGS: Record<BasemapId, BasemapConfig> = {
  // ── Vector basemaps (OpenFreeMap — crisp at all DPIs) ─────────────────────
  vectorDark: {
    id: "vectorDark",
    label: "Vector Dark",
    helper: "Crisp at all zoom levels · retina native",
    type: "vector",
    maximumLevel: 20,
    minimumLevel: 0,
    credit: "OpenFreeMap, OpenMapTiles, OpenStreetMap",
    qualityTier: "vector",
  },
  vectorLight: {
    id: "vectorLight",
    label: "Vector Light",
    helper: "Light theme · crisp labels",
    type: "vector",
    maximumLevel: 20,
    minimumLevel: 0,
    credit: "OpenFreeMap, OpenMapTiles, OpenStreetMap",
    qualityTier: "vector",
  },
  vectorLiberty: {
    id: "vectorLiberty",
    label: "Vector Liberty",
    helper: "Classic cartographic style · crisp labels",
    type: "vector",
    maximumLevel: 20,
    minimumLevel: 0,
    credit: "OpenFreeMap, OpenMapTiles, OpenStreetMap",
    qualityTier: "vector",
  },
  // ── Raster basemaps (legacy fallback) ─────────────────────────────────────
  osmDark: {
    id: "osmDark",
    label: "Carto Dark (raster)",
    helper: "Raster tiles · may appear soft on Retina",
    type: "raster",
    urlTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png",
    retinaTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
    maximumLevel: 20,
    minimumLevel: 0,
    tileWidth: 256,
    tileHeight: 256,
    retinaTileWidth: 512,
    retinaTileHeight: 512,
    supportsRetina: true,
    subdomains: ["a", "b", "c", "d"],
    credit: "Carto, OSM",
    qualityTier: "high",
  },
  osmLight: {
    id: "osmLight",
    label: "Carto Light (raster)",
    helper: "Raster tiles · may appear soft on Retina",
    type: "raster",
    urlTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png",
    retinaTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}@2x.png",
    maximumLevel: 20,
    minimumLevel: 0,
    tileWidth: 256,
    tileHeight: 256,
    retinaTileWidth: 512,
    retinaTileHeight: 512,
    supportsRetina: true,
    subdomains: ["a", "b", "c", "d"],
    credit: "Carto, OSM",
    qualityTier: "high",
  },
  osmStandard: {
    id: "osmStandard",
    label: "OpenStreetMap (raster)",
    helper: "Standard tiles · may appear soft on Retina",
    type: "raster",
    urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    retinaTemplate: null,
    maximumLevel: 19,
    minimumLevel: 0,
    tileWidth: 256,
    tileHeight: 256,
    retinaTileWidth: 256,
    retinaTileHeight: 256,
    supportsRetina: false,
    subdomains: [],
    credit: "OpenStreetMap contributors",
    qualityTier: "fallback",
  },
};

export const BASEMAP_LIST = Object.values(BASEMAP_CONFIGS);
export const VECTOR_BASEMAPS = BASEMAP_LIST.filter(b => b.type === "vector");
export const RASTER_BASEMAPS = BASEMAP_LIST.filter(b => b.type === "raster");
