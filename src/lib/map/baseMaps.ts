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
  urlTemplate: string;
  retinaTemplate: string | null;
  maximumLevel: number;
  minimumLevel: number;
  tileWidth: number;
  tileHeight: number;
  retinaTileWidth: number;
  retinaTileHeight: number;
  supportsRetina: boolean;
  subdomains: string[];
  credit: string;
  /** "high" = Carto retina; "medium" = Carto non-retina; "fallback" = OSM */
  qualityTier: "high" | "medium" | "fallback";
};

export const BASEMAP_CONFIGS: Record<BasemapId, BasemapConfig> = {
  osmDark: {
    id: "osmDark",
    label: "Carto Dark",
    helper: "Recommended · dark theme · retina support",
    urlTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png",
    retinaTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}@2x.png",
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
    label: "Carto Light",
    helper: "Light theme · retina support",
    urlTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png",
    retinaTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}@2x.png",
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
    label: "OpenStreetMap",
    helper: "Standard tiles · may appear soft on Retina displays",
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
