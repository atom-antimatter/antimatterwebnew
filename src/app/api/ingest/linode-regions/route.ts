/**
 * POST /api/ingest/linode-regions
 *
 * Protected ingest: fetches Akamai/Linode /regions + /regions/availability,
 * normalises, and upserts into `provider_regions`.
 *
 * Auth: requires header `x-ingest-secret` == process.env.INGEST_SECRET
 *
 * Cron-friendly: idempotent upsert on (provider, region_id).
 * Run locally:
 *   curl -X POST http://localhost:3000/api/ingest/linode-regions \
 *     -H "x-ingest-secret: $INGEST_SECRET"
 *
 * Via GitHub Actions (add to .github/workflows/ingest.yml):
 *   - name: Ingest Linode regions
 *     run: curl -X POST ${{ vars.APP_URL }}/api/ingest/linode-regions
 *              -H "x-ingest-secret: ${{ secrets.INGEST_SECRET }}"
 */
import { NextResponse } from "next/server";
import { fetchLinodeRegions, fetchLinodeAvailability } from "@/lib/providers/linode/fetch";
import { normalizeLinodeRegions } from "@/lib/providers/linode/normalize";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = request.headers.get("x-ingest-secret");
  const expectedSecret = process.env.INGEST_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[linode/ingest] Starting Linode region ingestion…");

    // ── Fetch ────────────────────────────────────────────────────────────────
    const [regions, availability] = await Promise.allSettled([
      fetchLinodeRegions(),
      fetchLinodeAvailability(),
    ]);

    const regionData    = regions.status      === "fulfilled" ? regions.value      : [];
    const availData     = availability.status === "fulfilled" ? availability.value : [];

    if (regions.status === "rejected") {
      console.error("[linode/ingest] /regions failed:", (regions as PromiseRejectedResult).reason);
    }
    if (availability.status === "rejected") {
      console.warn("[linode/ingest] /availability failed (non-fatal):", (availability as PromiseRejectedResult).reason);
    }

    if (regionData.length === 0) {
      return NextResponse.json({ error: "No regions returned from Linode API" }, { status: 502 });
    }

    // ── Normalise ─────────────────────────────────────────────────────────
    const normalized = await normalizeLinodeRegions(regionData, availData);

    console.log(`[linode/ingest] Normalised ${normalized.length} regions`);

    // ── Upsert to Supabase ────────────────────────────────────────────────
    const supabase = getSupabaseAdmin();
    const rows = normalized.map(r => ({
      provider:     r.provider,
      region_id:    r.region_id,
      label:        r.label,
      country:      r.country,
      city:         r.city,
      site_type:    r.site_type,
      lat:          r.lat,
      lon:          r.lng,
      capabilities: r.capabilities,
      availability: r.availability,
      status:       r.status,
      source:       r.source,
      updated_at:   new Date().toISOString(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: upsertError } = await (supabase as any)
      .from("provider_regions")
      .upsert(rows, { onConflict: "provider,region_id" });

    if (upsertError) {
      console.error("[linode/ingest] Supabase upsert error:", upsertError.message);
      // Return partial success — we still return the data even if DB write failed
      return NextResponse.json({
        ok:       false,
        warning:  "Regions fetched but DB upsert failed: " + upsertError.message,
        regions:  normalized.length,
      }, { status: 207 });
    }

    const missingCoords = normalized.filter(r => r.lat === null).map(r => r.region_id);
    console.log(`[linode/ingest] Done. ${normalized.length} upserted. Missing coords: ${missingCoords.length}`);

    return NextResponse.json({
      ok:             true,
      regions:        normalized.length,
      missingCoords,
      attribution:    "Akamai/Linode API v4 — https://www.linode.com/docs/api/regions/",
    });
  } catch (err) {
    console.error("[linode/ingest] Unexpected error:", err);
    return NextResponse.json({ error: "Ingest failed: " + String(err) }, { status: 500 });
  }
}

// ── Fallback GET — explain the route ─────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    info: "POST to this endpoint with header x-ingest-secret to ingest Linode regions.",
    source: "https://api.linode.com/v4/regions",
  });
}
