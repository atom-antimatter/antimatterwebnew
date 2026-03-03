/**
 * Server-side fetchers for the Akamai/Linode API.
 * NEVER import this in client components — uses LINODE_TOKEN env var.
 */
import {
  LinodeRegionsResponseSchema,
  LinodeAvailabilityResponseSchema,
  type LinodeRegion,
  type LinodeAvailability,
} from "./types";

const BASE = "https://api.linode.com/v4";

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    "Accept":     "application/json",
    "User-Agent": "AntimatterAI-Atlas/1.0 (https://antimatterai.com/data-center-map)",
  };
  const token = process.env.LINODE_TOKEN;
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export async function fetchLinodeRegions(): Promise<LinodeRegion[]> {
  const res = await fetch(`${BASE}/regions?page_size=200`, {
    headers: headers(),
    next: { revalidate: 3600 }, // Next.js cache for 1 h
  });
  if (!res.ok) {
    throw new Error(`Linode /regions error: ${res.status} ${await res.text().catch(() => "")}`);
  }
  const json = await res.json();
  const parsed = LinodeRegionsResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error("[linode/fetch] /regions schema validation failed:", parsed.error.message);
    return [];
  }
  return parsed.data.data;
}

export async function fetchLinodeAvailability(): Promise<LinodeAvailability[]> {
  const res = await fetch(`${BASE}/regions/availability`, {
    headers: headers(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    // Availability endpoint may require auth; return empty gracefully
    console.warn(`[linode/fetch] /regions/availability: ${res.status} — skipping availability data`);
    return [];
  }
  const json = await res.json();
  const parsed = LinodeAvailabilityResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error("[linode/fetch] /regions/availability schema validation failed:", parsed.error.message);
    return [];
  }
  return parsed.data.data;
}
