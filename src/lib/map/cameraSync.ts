/**
 * cameraSync.ts — convert between Cesium camera height and MapLibre zoom level.
 *
 * MapLibre uses Web Mercator zoom levels (0–22).
 * Cesium uses camera height above the ellipsoid in metres.
 *
 * At the equator, ground resolution at zoom z:
 *   groundRes(z) = (2π × R) / (256 × 2^z)  metres/pixel
 *
 * We relate camera height to zoom via:
 *   height ≈ groundRes(z) × viewportWidth / 2
 *   → z = log2((2π × R × viewportWidth) / (256 × 2 × height))
 */

const R = 6378137;
const CIRCUM = 2 * Math.PI * R;

export function heightToMapLibreZoom(heightMetres: number, viewportWidth = 1280): number {
  const z = Math.log2((CIRCUM * viewportWidth) / (256 * 2 * Math.max(heightMetres, 1)));
  return Math.max(0, Math.min(22, z));
}

export function mapLibreZoomToHeight(zoom: number, viewportWidth = 1280): number {
  return (CIRCUM * viewportWidth) / (256 * 2 * Math.pow(2, zoom));
}

/**
 * The camera height at which we transition between Cesium (globe) and MapLibre (city).
 * Below this height, MapLibre renders; above it, Cesium renders.
 */
export const TRANSITION_HEIGHT = 3_500_000;
export const TRANSITION_ZOOM = heightToMapLibreZoom(TRANSITION_HEIGHT);
