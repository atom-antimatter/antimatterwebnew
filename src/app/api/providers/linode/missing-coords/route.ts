/**
 * GET /api/providers/linode/missing-coords
 *
 * Reports Linode region slugs that exist in the Linode API but have no
 * entry in data/linode-region-coordinates.json.
 *
 * Use this to discover what needs to be added to the coordinates file.
 */
import { NextResponse } from "next/server";
import { fetchLinodeRegions } from "@/lib/providers/linode/fetch";
import { getMissingCoords } from "@/lib/providers/linode/normalize";

export async function GET() {
  try {
    const regions = await fetchLinodeRegions();
    const regionIds = regions.map(r => r.id);
    const missing = await getMissingCoords(regionIds);

    return NextResponse.json({
      total:   regionIds.length,
      missing: missing.length,
      ids:     missing,
      note:    "Add these region_ids to /data/linode-region-coordinates.json with { lat, lng, city, country }",
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
