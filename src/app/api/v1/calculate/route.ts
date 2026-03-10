/**
 * POST /api/v1/calculate — Cost estimation and ranked recommendation engine.
 *
 * Input: target_kw, preferred_states, max_rate, min_renewable_pct, max_pue, tier, provider
 * Output: estimated costs, shortlisted states, shortlisted facilities, score breakdown
 */
import { NextResponse } from "next/server";
import { loadStates, loadFacilities } from "@/lib/power/loadPowerData";
import { scoreState, scoreFacility, rankStates, rankFacilities } from "@/lib/power/powerRanking";

export const dynamic = "force-dynamic";

type CalcRequest = {
  target_kw?: number;
  target_mw?: number;
  preferred_states?: string[];
  max_rate?: number;
  min_renewable_pct?: number;
  max_pue?: number;
  tier?: string;
  provider?: string;
  limit?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CalcRequest;
    const targetKw = body.target_kw ?? (body.target_mw ? body.target_mw * 1000 : 100);
    const targetMw = targetKw / 1000;
    const maxRate = body.max_rate ?? 999;
    const minRenewable = body.min_renewable_pct ?? 0;
    const maxPue = body.max_pue ?? 99;
    const limit = Math.min(20, body.limit ?? 10);

    const states = loadStates();
    const facilities = loadFacilities();

    // Filter states
    let filteredStates = states.filter(s =>
      s.industrial_rate_kwh <= maxRate &&
      (!body.preferred_states?.length || body.preferred_states.some(ps => ps.toLowerCase() === s.state.toLowerCase())) &&
      (!body.tier || s.tier === body.tier)
    );
    filteredStates = rankStates(filteredStates).slice(0, limit);

    // Filter facilities
    let filteredFacilities = facilities.filter(f =>
      f.est_rate_kwh <= maxRate &&
      f.renewable_energy_pct >= minRenewable &&
      f.pue <= maxPue &&
      (!body.provider || f.provider.toLowerCase().includes(body.provider.toLowerCase())) &&
      (!body.tier || f.tier_rating === body.tier) &&
      (!body.preferred_states?.length || body.preferred_states.some(ps => ps.toLowerCase() === f.state.toLowerCase()))
    );
    filteredFacilities = rankFacilities(filteredFacilities).slice(0, limit);

    // Cost estimates
    const hoursPerMonth = 730;
    const hoursPerYear = 8760;

    const stateResults = filteredStates.map(s => ({
      state: s.state,
      tier: s.tier,
      power_feasibility_score: s.power_feasibility_score,
      composite_score: scoreState(s, states),
      industrial_rate_kwh: s.industrial_rate_kwh,
      estimated_monthly_cost: Math.round(targetKw * s.industrial_rate_kwh * hoursPerMonth / 100),
      estimated_annual_cost: Math.round(targetKw * s.industrial_rate_kwh * hoursPerYear / 100),
      key_markets: s.key_markets,
    }));

    const facilityResults = filteredFacilities.map(f => ({
      provider: f.provider,
      facility_name: f.facility_name,
      city: f.city,
      state: f.state,
      tier_rating: f.tier_rating,
      power_feasibility_score: f.power_feasibility_score,
      composite_score: scoreFacility(f, facilities),
      est_rate_kwh: f.est_rate_kwh,
      pue: f.pue,
      renewable_energy_pct: f.renewable_energy_pct,
      estimated_monthly_cost: Math.round(targetKw * f.est_rate_kwh * hoursPerMonth / 100),
      estimated_annual_cost: Math.round(targetKw * f.est_rate_kwh * hoursPerYear / 100),
    }));

    return NextResponse.json({
      input: { target_kw: targetKw, target_mw: targetMw, max_rate: maxRate, min_renewable_pct: minRenewable, max_pue: maxPue },
      recommended_states: stateResults,
      recommended_facilities: facilityResults,
      meta: {
        states_evaluated: states.length,
        facilities_evaluated: facilities.length,
        states_matched: stateResults.length,
        facilities_matched: facilityResults.length,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
