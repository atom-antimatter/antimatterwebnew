import axios from "axios";

import { GoogleImageSearchResponse } from "../types/search";

const getGoogleKeys = () => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX || process.env.GOOGLE_CX_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");
  if (!cx) throw new Error("Missing GOOGLE_CX (Custom Search Engine ID)");
  return { apiKey, cx };
};

/**
 * Searches for an image using the Google Custom Search API.
 * @param query The search query string.
 * @returns An object containing the URL and thumbnail URL of the found image,
 * or a placeholder if an error occurs or no image is found.
 */
export const searchImage = async (query: string) => {
  const { apiKey, cx } = getGoogleKeys();
  const axiosInstance = axios.create({
    baseURL: "https://www.googleapis.com/customsearch/v1",
  });

  try {
    const response = await axiosInstance.get<GoogleImageSearchResponse>("", {
      params: {
        q: query,
        searchType: "image",
        key: apiKey,
        cx,
        num: 1,
        safe: "active",
        imgSize: "large",
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return { altText: query, imageUrl: null, thumbnailUrl: null };
    }

    return {
      url: response.data.items[0]?.link ?? "",
      thumbnailUrl: response.data.items[0]?.image?.thumbnailLink ?? "",
    };
  } catch {
    return {
      url: "https://via.placeholder.com/360x240",
      thumbnailUrl: "https://via.placeholder.com/360x240",
    };
  }
};
