/**
 * powerInsights.ts — Generates human-readable insight cards from power market data.
 */
import { rankStates, rankFacilities, rankProviders, type StateRecord, type FacilityRecord } from "./powerRanking";

export type Insight = {
  title: string;
  body: string;
  category: "state" | "facility" | "provider" | "market";
  metric?: string;
};

export function generateStateInsights(states: StateRecord[]): Insight[] {
  const insights: Insight[] = [];
  const byFeasibility = rankStates(states, "power_feasibility_score");
  const byCost = rankStates(states, "industrial_rate_kwh");
  const byCapacity = rankStates(states, "dc_capacity_mw");

  if (byFeasibility[0]) {
    insights.push({
      title: `${byFeasibility[0].state} leads on power feasibility`,
      body: `With a score of ${byFeasibility[0].power_feasibility_score}/100 and industrial rates at $${byFeasibility[0].industrial_rate_kwh}/kWh, ${byFeasibility[0].state} is the top-ranked state for data center power economics.`,
      category: "state",
      metric: `${byFeasibility[0].power_feasibility_score}/100`,
    });
  }

  if (byCost[0] && byCost[0].state !== byFeasibility[0]?.state) {
    insights.push({
      title: `${byCost[0].state} offers the lowest industrial power rates`,
      body: `At $${byCost[0].industrial_rate_kwh}/kWh, ${byCost[0].state} provides the most cost-competitive industrial electricity among all 50 states.`,
      category: "state",
      metric: `$${byCost[0].industrial_rate_kwh}/kWh`,
    });
  }

  if (byCapacity[0]) {
    insights.push({
      title: `${byCapacity[0].state} has the largest current DC capacity`,
      body: `With ${byCapacity[0].dc_capacity_mw.toLocaleString()} MW of existing data center capacity, ${byCapacity[0].state} remains the largest US hub.`,
      category: "state",
      metric: `${byCapacity[0].dc_capacity_mw.toLocaleString()} MW`,
    });
  }

  const tier1States = states.filter(s => s.tier === "Tier 1").length;
  insights.push({
    title: `${tier1States} states ranked Tier 1 for AI infrastructure`,
    body: `These states combine strong power feasibility, competitive rates, and meaningful existing capacity to support hyperscale and AI workload expansion.`,
    category: "market",
    metric: `${tier1States} Tier 1`,
  });

  return insights;
}

export function generateFacilityInsights(facilities: FacilityRecord[]): Insight[] {
  const insights: Insight[] = [];
  const byFeasibility = rankFacilities(facilities, "power_feasibility_score");
  const byPue = rankFacilities(facilities, "pue");
  const byRenewable = rankFacilities(facilities, "renewable_energy_pct");
  const providers = rankProviders(facilities);

  if (byFeasibility[0]) {
    insights.push({
      title: `${byFeasibility[0].facility_name} has the highest power feasibility`,
      body: `${byFeasibility[0].provider}'s ${byFeasibility[0].city}, ${byFeasibility[0].state} facility scores ${byFeasibility[0].power_feasibility_score}/100 for power feasibility.`,
      category: "facility",
      metric: `${byFeasibility[0].power_feasibility_score}/100`,
    });
  }

  if (byPue[0]) {
    insights.push({
      title: `Best PUE: ${byPue[0].facility_name} at ${byPue[0].pue}`,
      body: `${byPue[0].provider}'s facility achieves the dataset's lowest Power Usage Effectiveness, indicating superior energy efficiency.`,
      category: "facility",
      metric: `PUE ${byPue[0].pue}`,
    });
  }

  if (byRenewable[0]) {
    insights.push({
      title: `${byRenewable[0].facility_name} leads on renewable energy`,
      body: `At ${byRenewable[0].renewable_energy_pct}% renewable, ${byRenewable[0].provider}'s facility sets the benchmark for sustainable data center operations.`,
      category: "facility",
      metric: `${byRenewable[0].renewable_energy_pct}%`,
    });
  }

  if (providers[0]) {
    insights.push({
      title: `${providers[0].provider} is the top-ranked provider`,
      body: `Across ${providers[0].facilityCount} facilities, ${providers[0].provider} averages a ${providers[0].avgFeasibility}/100 feasibility score with ${providers[0].avgRenewable}% renewable energy.`,
      category: "provider",
      metric: `${providers[0].avgFeasibility}/100 avg`,
    });
  }

  return insights;
}
