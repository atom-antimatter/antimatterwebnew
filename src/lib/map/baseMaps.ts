/**
 * baseMaps.ts — centralised basemap configuration.
 *
 * Single source of truth for tile URLs, quality tiers, retina support,
 * and max zoom levels. Used by AtlasMap, LayersMenu, and the debug overlay.
 */

export type BasemapId = "osmDark" | "osmLight" | "osmStandard";

export type BasemapConfig = {
  id: BasemapId;
  label: string;
  helper: string;
  type: "raster";
  maximumLevel: number;
  minimumLevel: number;
  credit: string;
  qualityTier: "high" | "medium" | "fallback";
  urlTemplate: string;
  retinaTemplate: string | null;
  tileWidth: number;
  tileHeight: number;
  retinaTileWidth: number;
  retinaTileHeight: number;
  supportsRetina: boolean;
  subdomains: string[];
  notes: string;
  maxUsefulZoom: number;
};

export const BASEMAP_CONFIGS: Record<BasemapId, BasemapConfig> = {
  osmDark: {
    id: "osmDark",
    label: "Carto Dark",
    helper: "Recommended default · strongest contrast",
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
    notes: "Best overall clarity on dark UI; 512px retina tiles available.",
    maxUsefulZoom: 20,
  },
  osmLight: {
    id: "osmLight",
    label: "Carto Light",
    helper: "Light basemap for contrast checks",
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
    notes: "Useful for validating dark overlay contrast; 512px retina tiles available.",
    maxUsefulZoom: 20,
  },
  osmStandard: {
    id: "osmStandard",
    label: "OpenStreetMap",
    helper: "Fallback public raster tiles",
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
    notes: "No retina tile variant; keep as fallback only.",
    maxUsefulZoom: 19,
  },
};

export const BASEMAP_LIST = Object.values(BASEMAP_CONFIGS);
export const RASTER_BASEMAPS = BASEMAP_LIST;
