/**
 * Load frame sequence metadata and URLs for Clinix scroll-scrub.
 * Frames live in /public/clinix-frames/ (frame_0001.png, frame_0002.png, ...).
 */

export type ClinixFramesManifest = {
  totalFrames: number;
};

const MANIFEST_URL = "/clinix-frames/manifest.json";
const FRAME_BASE = "/clinix-frames/frame_";
const FRAME_EXT = ".png";

/**
 * Fetch manifest and return total frame count and frame URLs.
 * Returns null if manifest or frames are missing (show fallback).
 */
export async function loadFramesManifest(): Promise<{
  totalFrames: number;
  frameUrls: string[];
} | null> {
  try {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) return null;
    const data = (await res.json()) as ClinixFramesManifest;
    const totalFrames = data.totalFrames;
    if (!totalFrames || totalFrames < 1) return null;
    const frameUrls = Array.from(
      { length: totalFrames },
      (_, i) => `${FRAME_BASE}${String(i + 1).padStart(4, "0")}${FRAME_EXT}`
    );
    return { totalFrames, frameUrls };
  } catch {
    return null;
  }
}

/**
 * Preload frame images and return HTMLImageElement array.
 * Call this once when the section mounts to avoid flicker during scrub.
 */
export function preloadFrameImages(
  frameUrls: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<HTMLImageElement[]> {
  let loaded = 0;
  return Promise.all(
    frameUrls.map(
      (src) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            loaded++;
            onProgress?.(loaded, frameUrls.length);
            resolve(img);
          };
          img.onerror = reject;
          img.src = src;
        })
    )
  );
}
