/**
 * POST /api/search/parse
 *
 * Uses OpenAI to extract structured search intent from a natural-language query.
 * Only the raw query string and our capability vocabulary are sent to OpenAI.
 * No user PII is transmitted.
 *
 * Returns strict JSON validated with zod.
 * Falls back gracefully if OpenAI is unavailable or validation fails.
 *
 * Cache: 24h in-process cache keyed by normalised query.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { normalise } from "@/lib/search/normalize";
import { ALL_CAPABILITY_IDS } from "@/data/capabilityCatalog";

// ─── Output schema (zod) ─────────────────────────────────────────────────────

const TIERS   = ["core", "edge", "hyperscale", "enterprise", null] as const;
const MODES   = ["fly_to_location", "filter_only", "select_entity"] as const;
const ETYPES  = ["datacenter", "facility", "ixp", "any"] as const;

const ParseResultSchema = z.object({
  location_query: z.string().nullable(),
  radius_km:      z.number().int().min(0).max(5000).default(80),
  capabilities:   z.array(z.string()).default([]),
  tier:           z.enum(["core", "edge", "hyperscale", "enterprise"]).nullable().default(null),
  provider:       z.string().nullable().default(null),
  entity_type:    z.enum(["datacenter", "facility", "ixp", "any"]).default("any"),
  mode:           z.enum(["fly_to_location", "filter_only", "select_entity"]).default("fly_to_location"),
});

export type ParsedSearchIntent = z.infer<typeof ParseResultSchema>;

// ─── Cache ────────────────────────────────────────────────────────────────────

const CACHE = new Map<string, { result: ParsedSearchIntent; at: number }>();
const TTL_MS = 24 * 60 * 60 * 1000;

// ─── Provider list for prompt ─────────────────────────────────────────────────
// Curated short list — the model maps common variations to these.
const KNOWN_PROVIDERS = [
  "equinix", "digital realty", "cyrusone", "cyxtera", "coresite", "ntt",
  "aws", "google", "azure", "oracle", "alibaba", "telehouse",
  "global switch", "stack edge", "iron mountain", "vantage", "edgeconnex",
  "qts", "zayo", "cogent", "lumen", "switch",
] as const;

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are a search intent parser for an infrastructure atlas that shows data centers, IXPs, and fiber routes.
Extract structured intent from the user query and respond ONLY with a single JSON object — no prose.

Allowed capabilities: ${ALL_CAPABILITY_IDS.join(", ")}
Allowed tiers: core, edge, hyperscale, enterprise, null
Allowed entity_types: datacenter, facility, ixp, any
Allowed modes: fly_to_location, filter_only, select_entity
Known providers (normalise to these if possible): ${KNOWN_PROVIDERS.join(", ")}, or null

JSON schema:
{
  "location_query": "string (city/region/country for geocoding) or null",
  "radius_km": number (default 80, max 5000),
  "capabilities": ["from allowed list only"],
  "tier": "one of the allowed tiers or null",
  "provider": "normalised provider name or null",
  "entity_type": "one of the allowed entity_types",
  "mode": "fly_to_location | filter_only | select_entity"
}

Rules:
- If no location is mentioned, set location_query to null.
- Only include capabilities that appear in the allowed list; ignore others.
- If the query is a ZIP code, put it in location_query.
- Set mode="select_entity" when user names a specific facility.
- Do NOT output anything other than the JSON object.
`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let query: string;
  try {
    const body = await request.json();
    query = typeof body.query === "string" ? body.query.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!query || query.length < 2 || query.length > 300) {
    return NextResponse.json({ error: "Query must be 2–300 chars" }, { status: 400 });
  }

  const cacheKey = normalise(query);
  const hit = CACHE.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json(hit.result, {
      headers: { "X-Cache": "HIT" },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Silently fall back — search still works without NLP
    return NextResponse.json(
      { error: "NLP unavailable (no API key)" },
      { status: 503 }
    );
  }

  try {
    const openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",   // fast + cheap; gpt-4o for higher quality
        temperature: 0,
        max_tokens: 256,
        response_format: { type: "json_object" },
        messages: [
          { role: "system",  content: buildSystemPrompt() },
          { role: "user",    content: query },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!openAIRes.ok) {
      const errText = await openAIRes.text();
      console.error("[search/parse] OpenAI error:", openAIRes.status, errText.slice(0, 200));
      return NextResponse.json({ error: "NLP service error" }, { status: 502 });
    }

    const completion = await openAIRes.json();
    const content = completion.choices?.[0]?.message?.content ?? "";

    // Parse and validate with zod
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("[search/parse] JSON parse failed:", content.slice(0, 200));
      return NextResponse.json({ error: "NLP returned invalid JSON" }, { status: 502 });
    }

    const validated = ParseResultSchema.safeParse(parsed);
    if (!validated.success) {
      console.error("[search/parse] Zod validation failed:", validated.error.message);
      return NextResponse.json({ error: "NLP output schema mismatch" }, { status: 502 });
    }

    // Filter capabilities to only those in our allowed list
    const result: ParsedSearchIntent = {
      ...validated.data,
      capabilities: validated.data.capabilities.filter((c) => ALL_CAPABILITY_IDS.includes(c)),
    };

    CACHE.set(cacheKey, { result, at: Date.now() });

    return NextResponse.json(result, {
      headers: { "X-Cache": "MISS", "Cache-Control": "private, max-age=86400" },
    });
  } catch (err) {
    console.error("[search/parse] Unexpected error:", err);
    return NextResponse.json({ error: "NLP request failed" }, { status: 500 });
  }
}
