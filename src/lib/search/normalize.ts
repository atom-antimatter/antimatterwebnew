/**
 * normalize.ts — string normalisation for search matching.
 *
 * Provides consistent lowercasing, diacritic stripping, punctuation
 * collapsing and common location aliases so queries like
 * "nyc", "new york city", and "New York" all resolve the same way.
 */

// ─── City / region aliases ────────────────────────────────────────────────────
// Map common short names → canonical form used in the gazetteer.
export const CITY_ALIASES: Record<string, string> = {
  "nyc":              "new york",
  "new york city":    "new york",
  "ny city":          "new york",
  "la":               "los angeles",
  "sf":               "san francisco",
  "dc":               "washington",
  "washington dc":    "washington",
  "wash dc":          "washington",
  "chi":              "chicago",
  "philly":           "philadelphia",
  "h town":           "houston",
  "htx":              "houston",
  "atl":              "atlanta",
  "dal":              "dallas",
  "dfw":              "dallas",
  "sea":              "seattle",
  "pdx":              "portland",
  "bos":              "boston",
  "mia":              "miami",
  "phx":              "phoenix",
  "minnie":           "minneapolis",
  "twin cities":      "minneapolis",
  "london uk":        "london",
  "ldn":              "london",
  "lon":              "london",
  "paris france":     "paris",
  "frankfurt germany":"frankfurt",
  "ffm":              "frankfurt",
  "fra":              "frankfurt",
  "ams":              "amsterdam",
  "sgp":              "singapore",
  "sin":              "singapore",
  "hkg":              "hong kong",
  "hk":               "hong kong",
  "tok":              "tokyo",
  "tyo":              "tokyo",
  "syd":              "sydney",
  "mel":              "melbourne",
  "dxb":              "dubai",
  "joh":              "johannesburg",
  "jhb":              "johannesburg",
};

// Country name aliases
export const COUNTRY_ALIASES: Record<string, string> = {
  "usa":             "united states",
  "us":              "united states",
  "u.s.":           "united states",
  "u.s.a.":         "united states",
  "america":         "united states",
  "uk":              "united kingdom",
  "great britain":   "united kingdom",
  "gb":              "united kingdom",
  "uae":             "united arab emirates",
  "sa":              "south africa",
  "rsa":             "south africa",
};

// ─── Core normalise function ──────────────────────────────────────────────────

/**
 * Normalise a search string for comparison / indexing.
 * - Lowercase
 * - Strip accents/diacritics (NFD decompose then strip combining marks)
 * - Remove punctuation except hyphens (kept for postal codes like "EC1A 1BB")
 * - Collapse multiple whitespace
 * - Apply city/country aliases
 */
export function normalise(raw: string): string {
  let s = raw
    .normalize("NFD")
    .replace(/\p{M}/gu, "")   // strip combining diacritical marks
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ") // punctuation → space (keep alphanumeric, spaces, hyphens)
    .replace(/\s+/g, " ")
    .trim();

  // Apply city aliases
  for (const [alias, canonical] of Object.entries(CITY_ALIASES)) {
    if (s === alias) { s = canonical; break; }
  }

  // Apply country aliases
  for (const [alias, canonical] of Object.entries(COUNTRY_ALIASES)) {
    if (s === alias) { s = canonical; break; }
  }

  return s;
}

/**
 * Returns true if `query` looks like a US 5-digit ZIP code.
 */
export function isUsZip(query: string): boolean {
  return /^\d{5}$/.test(query.trim());
}

/**
 * Returns true if the query is short enough to be an abbreviation / code.
 */
export function isShortCode(query: string): boolean {
  return query.trim().length <= 4;
}

/**
 * Tokenise a query into words (split on spaces + common separators).
 * Useful for multi-word fuzzy matching.
 */
export function tokenise(query: string): string[] {
  return normalise(query).split(/[\s,+&|]+/).filter(Boolean);
}
