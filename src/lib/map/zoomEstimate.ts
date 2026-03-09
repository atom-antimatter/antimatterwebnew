/**
 * zoomEstimate.ts — helpers for Cesium camera-height ↔ tile-zoom conversion.
 *
 * These are approximations for Web-Mercator tile grids (OSM, Carto, etc.)
 * at the equator. They are accurate enough to detect over-zoom upscaling.
 */

/**
 * Convert Cesium camera height (metres above ellipsoid) to an approximate
 * Web-Mercator tile-zoom level.
 *
 * Formula derived from: at tile-zoom z, 1 pixel ≈ 156543.03 / 2^z metres.
 * We treat the canvas as ~1024px wide (typical) and adjust for resolutionScale.
 */
export function heightToTileZoom(
  heightMeters: number,
  canvasWidthPx = 1024,
): number {
  // Ground resolution at zoom z (metres/pixel at equator):
  //   groundRes(z) = (2π × R_earth) / (256 × 2^z)
  // Camera height where this zoom "makes sense":
  //   height ≈ groundRes(z) × canvasWidthPx / 2
  // → z = log2((2π × R_earth × canvasWidthPx) / (256 × 2 × height))
  const R = 6378137;
  const circum = 2 * Math.PI * R;
  const z = Math.log2((circum * canvasWidthPx) / (256 * 2 * Math.max(heightMeters, 1)));
  return Math.round(Math.max(0, z));
}

/** Minimum camera height (metres) at which provider maxLevel tiles are sharp. */
export function maxLevelToMinHeight(maxLevel: number, canvasWidthPx = 1024): number {
  const R = 6378137;
  const circum = 2 * Math.PI * R;
  // Solve heightToTileZoom(h) = maxLevel → h = circum × canvasWidthPx / (256 × 2 × 2^maxLevel)
  return (circum * canvasWidthPx) / (256 * 2 * Math.pow(2, maxLevel));
}

/** True if the camera is zoomed past the provider's max tile level. */
export function isOverZoomed(heightMeters: number, providerMaxLevel: number, canvasWidthPx = 1024): boolean {
  return heightToTileZoom(heightMeters, canvasWidthPx) > providerMaxLevel;
}

/** Max level per basemap. */
export const BASEMAP_MAX_LEVEL: Record<string, number> = {
  osmDark:       20,
  osmLight:      20,
  osmStandard:   19,
};

/** Recommended minimumZoomDistance (metres) for each basemap. */
export function getMinimumZoomDistance(basemap: string, canvasWidthPx = 1024): number {
  const maxLevel = BASEMAP_MAX_LEVEL[basemap] ?? 19;
  // Add 15% margin so we never actually upscale
  return maxLevelToMinHeight(maxLevel, canvasWidthPx) * 1.15;
}
