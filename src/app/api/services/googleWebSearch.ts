import axios from "axios";

import {
  GoogleWebSearchRequest,
  GoogleWebSearchResponse,
} from "../types/search";

const getGoogleKeys = () => {
  const apiKey = process.env.GOOGLE_API_KEY;
  // Support both naming conventions; Vercel env is typically GOOGLE_CX
  const cx = process.env.GOOGLE_CX || process.env.GOOGLE_CX_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");
  if (!cx) throw new Error("Missing GOOGLE_CX (Custom Search Engine ID)");
  return { apiKey, cx };
};

/**
 * Calls Google Custom Search API with the given query for web results.
 * @param params GoogleWebSearchRequest
 * @returns GoogleWebSearchResponse
 */
export async function googleWebSearch(
  params: GoogleWebSearchRequest,
): Promise<GoogleWebSearchResponse> {
  const { apiKey, cx } = getGoogleKeys();
  const {
    query,
    num = 10,
    cr,
    gl,
    siteSearch,
    exactTerms,
    dateRestrict,
  } = params;

  const url = "https://www.googleapis.com/customsearch/v1";
  const response = await axios.get<GoogleWebSearchResponse>(url, {
    params: {
      key: apiKey,
      cx,
      q: query,
      num,
      cr,
      gl,
      siteSearch,
      exactTerms,
      dateRestrict,
    },
  });
  return response.data;
}
