/**
 * GET /api/v1/states — Paginated, filterable state-level power market data.
 */
import { NextResponse } from "next/server";
import { loadStates } from "@/lib/power/loadPowerData";
import { rankStates, scoreState } from "@/lib/power/powerRanking";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let states = loadStates();
  if (!states.length) return NextResponse.json({ error: "No state data available" }, { status: 503 });

  // Filters
  const minFeasibility = Number(searchParams.get("min_power_feasibility_score") ?? "0");
  const maxCommRate = Number(searchParams.get("max_commercial_rate_kwh") ?? "999");
  const maxIndRate = Number(searchParams.get("max_industrial_rate_kwh") ?? "999");
  const tier = searchParams.get("tier");
  const stateFilter = searchParams.get("state");

  states = states.filter(s =>
    s.power_feasibility_score >= minFeasibility &&
    s.commercial_rate_kwh <= maxCommRate &&
    s.industrial_rate_kwh <= maxIndRate &&
    (!tier || s.tier === tier) &&
    (!stateFilter || s.state.toLowerCase() === stateFilter.toLowerCase())
  );

  // Sort
  const sort = searchParams.get("sort") ?? "composite";
  const validSorts = ["composite", "power_feasibility_score", "industrial_rate_kwh", "commercial_rate_kwh", "dc_capacity_mw", "annual_cost_1mw"];
  const sortKey = validSorts.includes(sort) ? sort : "composite";
  states = rankStates(states, sortKey as any);

  // Pagination
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50")));
  const start = (page - 1) * limit;
  const paged = states.slice(start, start + limit);

  return NextResponse.json({
    data: paged.map(s => ({ ...s, composite_score: scoreState(s, loadStates()) })),
    meta: { total: states.length, page, limit, sort: sortKey },
  }, { headers: { "Cache-Control": "public, max-age=300" } });
}
