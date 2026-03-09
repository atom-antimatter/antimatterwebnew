/**
 * quadkeys.ts — Convert lat/lng bounding boxes to Bing Maps quadkeys.
 *
 * The Microsoft Global Building Footprints dataset is partitioned by quadkeys.
 * This module converts viewport bounds to the quadkeys needed to fetch
 * building data for the visible area.
 *
 * Reference: https://learn.microsoft.com/en-us/bingmaps/articles/bing-maps-tile-system
 */

function latLngToPixelXY(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const mapSize = 256 << zoom;
  const x = ((lng + 180) / 360) * mapSize;
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * mapSize;
  return {
    x: Math.min(Math.max(x, 0), mapSize - 1),
    y: Math.min(Math.max(y, 0), mapSize - 1),
  };
}

function pixelXYToTileXY(pixelX: number, pixelY: number): { tileX: number; tileY: number } {
  return {
    tileX: Math.floor(pixelX / 256),
    tileY: Math.floor(pixelY / 256),
  };
}

function tileXYToQuadKey(tileX: number, tileY: number, zoom: number): string {
  let quadKey = "";
  for (let i = zoom; i > 0; i--) {
    let digit = 0;
    const mask = 1 << (i - 1);
    if ((tileX & mask) !== 0) digit += 1;
    if ((tileY & mask) !== 0) digit += 2;
    quadKey += digit.toString();
  }
  return quadKey;
}

/**
 * Get all quadkeys that intersect the given bounding box at the specified zoom level.
 */
export function bboxToQuadKeys(
  west: number, south: number, east: number, north: number,
  zoom: number
): string[] {
  const topLeft = latLngToPixelXY(north, west, zoom);
  const bottomRight = latLngToPixelXY(south, east, zoom);

  const tlTile = pixelXYToTileXY(topLeft.x, topLeft.y);
  const brTile = pixelXYToTileXY(bottomRight.x, bottomRight.y);

  const quadKeys: string[] = [];
  for (let ty = tlTile.tileY; ty <= brTile.tileY; ty++) {
    for (let tx = tlTile.tileX; tx <= brTile.tileX; tx++) {
      quadKeys.push(tileXYToQuadKey(tx, ty, zoom));
    }
  }
  return quadKeys;
}

/** The zoom level used by the Microsoft dataset for partitioning (level 9). */
export const MS_BUILDING_QUADKEY_ZOOM = 9;
