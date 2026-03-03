import { NextResponse } from "next/server";

/** Nominatim result item. */
type NominatimResult = {
  lat: string;
  lon: string;
  display_name?: string;
  boundingbox?: string[];
};

/**
 * GET /api/geocode?q=Atlanta
 * Geocodes a place name or postal code to lat/lng using Nominatim (OSM).
 * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
 * One request per second; set User-Agent.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const countryCode = searchParams.get("country"); // optional bias e.g. "us"

  if (!q || typeof q !== "string" || !q.trim()) {
    return NextResponse.json(
      { error: "Missing or empty query parameter: q" },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    q: q.trim(),
    format: "json",
    limit: "5",
  });
  if (countryCode?.trim()) params.set("countrycodes", countryCode.trim());

  try {
    // Nominatim usage policy: max 1 request per second.
    await new Promise((r) => setTimeout(r, 1100));
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "AntimatterAI-DataCenterMap/1.0 (https://antimatterai.com/data-center-map)",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Geocoding service unavailable" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as NominatimResult[];
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { results: [], message: "No results found" },
        { status: 200 }
      );
    }

    const results = data.map((r) => ({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      displayName: r.display_name ?? `${r.lat}, ${r.lon}`,
      boundingBox: r.boundingbox,
    }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[geocode]", err);
    return NextResponse.json(
      { error: "Geocoding failed" },
      { status: 500 }
    );
  }
}
