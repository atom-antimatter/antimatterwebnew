import type { BasemapId } from "@/lib/map/baseMaps";
import type { OverlayKey, PowerLayerKey, ProviderLayerKey } from "@/state/atlasLayersStore";

export type BasemapRegistryItem = {
  id: BasemapId;
  label: string;
  helper: string;
  notes: string;
  maxUsefulZoom: number;
  qualityTier: "high" | "medium" | "fallback";
};

export const BASEMAP_REGISTRY: BasemapRegistryItem[] = [
  {
    id: "osmDark",
    label: "Carto Dark",
    helper: "Recommended default",
    notes: "Best contrast for the Atlas dark UI and strongest retina support.",
    maxUsefulZoom: 20,
    qualityTier: "high",
  },
  {
    id: "osmLight",
    label: "Carto Light",
    helper: "Contrast validation",
    notes: "Useful for checking dark overlay readability against a light basemap.",
    maxUsefulZoom: 20,
    qualityTier: "high",
  },
  {
    id: "osmStandard",
    label: "OpenStreetMap",
    helper: "Fallback only",
    notes: "No retina tile variant; use only when Carto is unavailable.",
    maxUsefulZoom: 19,
    qualityTier: "fallback",
  },
];

export type LayerRegistryItem = {
  id: OverlayKey | PowerLayerKey | ProviderLayerKey;
  section: "boundaries" | "infrastructure" | "power" | "providers";
  title: string;
  source: string;
  description: string;
  minCameraLevel?: "WORLD" | "REGION" | "LOCAL" | "CITY";
  literal: boolean;
  confidenceNote?: string;
};

export const LAYER_REGISTRY: LayerRegistryItem[] = [
  {
    id: "countryBorders",
    section: "boundaries",
    title: "Country borders",
    source: "Natural Earth",
    description: "Cesium-native border overlay for world and regional context.",
    literal: true,
  },
  {
    id: "stateBorders",
    section: "boundaries",
    title: "State / province borders",
    source: "Natural Earth admin-1",
    description: "Higher-detail political boundaries for regional and local views.",
    literal: true,
    minCameraLevel: "REGION",
  },
  {
    id: "cities",
    section: "boundaries",
    title: "Extra city labels",
    source: "Natural Earth populated places",
    description: "Cesium-native major city labels for improved readability.",
    literal: true,
    minCameraLevel: "REGION",
  },
  {
    id: "points",
    section: "infrastructure",
    title: "Data centers",
    source: "Atlas dataset",
    description: "Primary facility markers and clustering.",
    literal: true,
  },
  {
    id: "routes",
    section: "infrastructure",
    title: "Fiber routes",
    source: "TeleGeography",
    description: "Global submarine and terrestrial cable routes rendered as persistent Cesium primitives.",
    literal: true,
    confidenceNote: "Routes may be approximate depending on source resolution.",
  },
  {
    id: "powerGeneration",
    section: "infrastructure",
    title: "Nearby generation",
    source: "EIA-860",
    description: "Large generation assets sized by MW.",
    literal: true,
    minCameraLevel: "REGION",
  },
  {
    id: "powerHeatmap",
    section: "power",
    title: "Feasibility heatmap",
    source: "Atlas power scoring",
    description: "Batched viewport score overlay for cost, carbon, generation, and queue pressure.",
    literal: false,
    confidenceNote: "Proxy model; not a guarantee of interconnection or utility service.",
  },
  {
    id: "powerQueue",
    section: "power",
    title: "Interconnection queue",
    source: "ISO/RTO queue publications",
    description: "Queued MW proxy, not available capacity.",
    literal: false,
    confidenceNote: "Approximation of pressure, not actual grid headroom.",
  },
  {
    id: "linodeRegions",
    section: "providers",
    title: "Akamai / Linode regions",
    source: "Linode API",
    description: "Cloud provider region markers.",
    literal: true,
  },
];
