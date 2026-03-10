/**
 * GET /api/v1/facilities — Paginated, filterable facility-level power market data.
 */
import { NextResponse } from "next/server";
import { loadFacilities } from "@/lib/power/loadPowerData";
import { rankFacilities, scoreFacility } from "@/lib/power/powerRanking";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let facilities = loadFacilities();
  if (!facilities.length) return NextResponse.json({ error: "No facility data available" }, { status: 503 });

  // Filters
  const provider = searchParams.get("provider");
  const state = searchParams.get("state");
  const minFeasibility = Number(searchParams.get("min_power_feasibility_score") ?? "0");
  const maxPue = Number(searchParams.get("max_pue") ?? "99");
  const minRenewable = Number(searchParams.get("min_renewable_energy_pct") ?? "0");
  const tierRating = searchParams.get("tier_rating");
  const maxRate = Number(searchParams.get("max_est_rate_kwh") ?? "999");

  facilities = facilities.filter(f =>
    f.power_feasibility_score >= minFeasibility &&
    f.pue <= maxPue &&
    f.renewable_energy_pct >= minRenewable &&
    f.est_rate_kwh <= maxRate &&
    (!provider || f.provider.toLowerCase().includes(provider.toLowerCase())) &&
    (!state || f.state.toLowerCase() === state.toLowerCase()) &&
    (!tierRating || f.tier_rating === tierRating)
  );

  // Sort
  const sort = searchParams.get("sort") ?? "composite";
  const validSorts = ["composite", "power_feasibility_score", "est_rate_kwh", "pue", "renewable_energy_pct", "annual_cost_1mw"];
  const sortKey = validSorts.includes(sort) ? sort : "composite";
  facilities = rankFacilities(facilities, sortKey as any);

  // Pagination
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50")));
  const start = (page - 1) * limit;
  const paged = facilities.slice(start, start + limit);

  return NextResponse.json({
    data: paged.map(f => ({ ...f, composite_score: scoreFacility(f, loadFacilities()) })),
    meta: { total: facilities.length, page, limit, sort: sortKey },
  }, { headers: { "Cache-Control": "public, max-age=300" } });
}
