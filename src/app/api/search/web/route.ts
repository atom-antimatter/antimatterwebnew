"use server";

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

import { googleWebSearch } from "../../services/googleWebSearch";
import { GoogleWebSearchRequest } from "../../types/search";

/**
 * API endpoint for Google web search.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the request body
    const searchRequest: GoogleWebSearchRequest = {
      query: body.query,
      // Lower default to reduce quota pressure; still allow caller to request up to 10.
      num: Math.min(Number(body.num ?? 5) || 5, 10),
      cr: body.cr,
      gl: body.gl,
      siteSearch: body.siteSearch,
      exactTerms: body.exactTerms,
      dateRestrict: body.dateRestrict,
    };

    // Validate required fields
    if (!searchRequest.query || typeof searchRequest.query !== "string") {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 },
      );
    }

    // Call the Google Web Search service
    const response = await googleWebSearch(searchRequest);

    // CDN cache to reduce quota pressure; safe since results are public and query-based.
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error in web search endpoint:", error);

    // Preserve rate limit status so the UI can show a helpful message (instead of "no results").
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      return NextResponse.json(
        {
          error:
            "Google search is temporarily rate-limited (429). Please retry in a minute.",
        },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
