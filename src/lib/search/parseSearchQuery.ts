import { ALL_CAPABILITY_IDS } from "@/data/capabilityCatalog";

export type ParsedQuery = {
  /** Cleaned place/location string to send to geocode API. Empty if none found. */
  placeQuery: string;
  /** Capability IDs extracted from the query text. */
  capabilities: string[];
  /** Tier keyword found in the query, if any. */
  tier: "core" | "edge" | "hyperscale" | "enterprise" | null;
};

// Words to strip out as spatial prepositions (they aren't part of the place name).
const PREPOSITIONS = new Set(["in", "near", "at", "around", "within", "by", "from"]);

// Tier keyword → canonical tier value
const TIER_KEYWORDS: Record<string, ParsedQuery["tier"]> = {
  "core": "core",
  "edge": "edge",
  "hyperscale": "hyperscale",
  "hyper-scale": "hyperscale",
  "enterprise": "enterprise",
};

// Additional keyword aliases for capabilities
const CAPABILITY_ALIASES: Record<string, string> = {
  "colo": "colocation",
  "colocated": "colocation",
  "co-location": "colocation",
  "ix": "interconnect",
  "internet exchange": "interconnect",
  "peering": "interconnect",
  "ai compute": "gpu",
  "machine learning": "gpu",
  "ml": "gpu",
  "dl": "gpu",
  "artificial intelligence": "gpu",
  "high performance": "hpc",
  "bare metal": "bare-metal",
  "baremetal": "bare-metal",
  "dedicated": "bare-metal",
  "direct": "direct-connect",
  "private line": "direct-connect",
  "soc2": "compliance:soc2",
  "soc 2": "compliance:soc2",
  "hipaa": "compliance:hipaa",
  "sovereign": "sovereign",
  "national": "sovereign",
};

/**
 * Deterministic search query parser.
 * Extracts capability and tier tokens from a natural-language query,
 * leaving the remaining text as a place query for geocoding.
 *
 * Examples:
 *   "colocation in Atlanta"  → { placeQuery: "Atlanta", capabilities: ["colocation"], tier: null }
 *   "GPU data centers near London"  → { placeQuery: "London", capabilities: ["gpu"], tier: null }
 *   "hyperscale data centers in Texas"  → { placeQuery: "Texas", capabilities: [], tier: "hyperscale" }
 *   "30308"  → { placeQuery: "30308", capabilities: [], tier: null }
 */
export function parseSearchQuery(raw: string): ParsedQuery {
  const lower = raw.toLowerCase().trim();

  const capabilities: string[] = [];
  let tier: ParsedQuery["tier"] = null;

  // Track which character ranges to remove from the original query to produce placeQuery.
  // We rebuild the place query by removing matched tokens.
  let working = lower;

  // 1. Match multi-word aliases first (longest match wins).
  const multiWordAliases = Object.entries(CAPABILITY_ALIASES)
    .filter(([k]) => k.includes(" "))
    .sort((a, b) => b[0].length - a[0].length);

  for (const [alias, capId] of multiWordAliases) {
    if (working.includes(alias)) {
      if (!capabilities.includes(capId)) capabilities.push(capId);
      working = working.replaceAll(alias, " ");
    }
  }

  // 2. Tokenise remaining text
  const tokens = working.split(/[\s,+&|]+/).filter(Boolean);
  const remainingTokens: string[] = [];

  for (const token of tokens) {
    // Skip spatial prepositions
    if (PREPOSITIONS.has(token)) continue;

    // Skip generic filler words
    if (["data", "center", "centers", "centre", "centres", "dc", "facility", "facilities"].includes(token)) continue;

    // Check for tier keyword
    if (TIER_KEYWORDS[token]) {
      tier = TIER_KEYWORDS[token];
      continue;
    }

    // Check for exact capability ID
    if (ALL_CAPABILITY_IDS.includes(token)) {
      if (!capabilities.includes(token)) capabilities.push(token);
      continue;
    }

    // Check single-word alias
    const aliasMatch = CAPABILITY_ALIASES[token];
    if (aliasMatch) {
      if (!capabilities.includes(aliasMatch)) capabilities.push(aliasMatch);
      continue;
    }

    // Otherwise it's part of the place name
    remainingTokens.push(token);
  }

  const placeQuery = remainingTokens.join(" ").trim();

  return { placeQuery, capabilities, tier };
}
