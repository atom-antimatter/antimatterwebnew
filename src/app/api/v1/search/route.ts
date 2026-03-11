/**
 * GET /api/v1/search?q=... — Unified fuzzy search across states, facilities, and providers.
 */
import { NextResponse } from "next/server";
import { loadStates, loadFacilities } from "@/lib/power/loadPowerData";
import { scoreState, scoreFacility } from "@/lib/power/powerRanking";

export const dynamic = "force-dynamic";

function fuzzyMatch(text: string, query: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  const words = q.split(/\s+/);
  return words.every(w => t.includes(w));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "Missing q parameter" }, { status: 400 });

  const states = loadStates();
  const facilities = loadFacilities();
  const limit = Math.min(50, Number(searchParams.get("limit") ?? "20"));

  // Search states
  const matchedStates = states
    .filter(s => fuzzyMatch(`${s.state} ${s.key_markets} ${s.tier} ${s.notes}`, q))
    .slice(0, limit)
    .map(s => ({ type: "state" as const, ...s, composite_score: scoreState(s, states) }));

  // Search facilities
  const matchedFacilities = facilities
    .filter(f => fuzzyMatch(`${f.provider} ${f.facility_name} ${f.city} ${f.state} ${f.tier_rating} ${f.notes}`, q))
    .slice(0, limit)
    .map(f => ({ type: "facility" as const, ...f, composite_score: scoreFacility(f, facilities) }));

  // Search providers (aggregate)
  const providerSet = new Set<string>();
  facilities.forEach(f => {
    if (fuzzyMatch(f.provider, q)) providerSet.add(f.provider);
  });
  const matchedProviders = Array.from(providerSet).slice(0, 10).map(p => ({
    type: "provider" as const,
    provider: p,
    facilities: facilities.filter(f => f.provider === p).length,
  }));

  return NextResponse.json({
    query: q,
    results: {
      states: matchedStates,
      facilities: matchedFacilities,
      providers: matchedProviders,
    },
    meta: {
      stateCount: matchedStates.length,
      facilityCount: matchedFacilities.length,
      providerCount: matchedProviders.length,
    },
  }, { headers: { "Cache-Control": "public, max-age=60" } });
}
