/**
 * Load frame sequence for Clinix scroll-scrub.
 * Frames expected in /public/clinix-frames/ (e.g. frame_0001.png, frame_0002.png).
 * Supports .png, .jpg, .webp; padding is 4-digit by default (frame_0001).
 */

export type ClinixFramesManifest = {
  totalFrames: number;
  /** Optional: ".png" | ".jpg" | ".webp" if manifest specifies */
  frameExtension?: string;
  /** Optional: number of digits for frame number, e.g. 4 => frame_0001 */
  framePad?: number;
};

const MANIFEST_URL = "/clinix-frames/manifest.json";
const FRAME_BASE = "/clinix-frames/frame_";

/** Default: 4-digit zero-padded, .png (matches extract script) */
const DEFAULT_EXT = ".png";
const DEFAULT_PAD = 4;

export type LoadFramesResult = {
  totalFrames: number;
  frameUrls: string[];
  images: HTMLImageElement[];
  firstFrameUrl: string;
};

export type LoadFramesError = {
  totalFrames: number;
  frameUrls: string[];
  firstFrameUrl: string;
  failedUrls: string[];
  message: string;
};

/**
 * Fetch manifest. Returns null if missing or invalid.
 */
export async function loadFramesManifest(): Promise<{
  totalFrames: number;
  frameUrls: string[];
  firstFrameUrl: string;
  frameExtension: string;
  framePad: number;
} | null> {
  try {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) return null;
    const data = (await res.json()) as ClinixFramesManifest;
    const totalFrames = Number(data.totalFrames);
    if (!totalFrames || totalFrames < 1) return null;

    const ext = (data.frameExtension ?? DEFAULT_EXT).replace(/^\.?/, ".") as string;
    const pad = Number(data.framePad) || DEFAULT_PAD;

    const frameUrls = Array.from(
      { length: totalFrames },
      (_, i) => `${FRAME_BASE}${String(i + 1).padStart(pad, "0")}${ext}`
    );
    const firstFrameUrl = frameUrls[0] ?? `${FRAME_BASE}${String(1).padStart(pad, "0")}${ext}`;

    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.log("[loadFrames] manifest ok", { totalFrames, frameUrls: frameUrls.slice(0, 3), firstFrameUrl });
    }

    return { totalFrames, frameUrls, firstFrameUrl, frameExtension: ext, framePad: pad };
  } catch (e) {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.warn("[loadFrames] manifest failed", e);
    }
    return null;
  }
}

/**
 * Try to load the first frame from a candidate URL. Resolves with the URL if it loads.
 */
function tryLoadFirstFrameUrl(candidateUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(candidateUrl);
    img.onerror = () => reject(new Error(`Failed to load: ${candidateUrl}`));
    img.src = candidateUrl;
  });
}

/**
 * Discover which first-frame URL actually works (extension and padding).
 * Tries: frame_0001.png, frame_001.png, frame_1.png, frame_0001.webp, frame_0001.jpg.
 */
export async function discoverFirstFrameUrl(): Promise<{
  firstFrameUrl: string;
  frameUrls: string[];
  totalFrames: number;
} | null> {
  const candidates = [
    "/clinix-frames/frame_0001.png",
    "/clinix-frames/frame_001.png",
    "/clinix-frames/frame_1.png",
    "/clinix-frames/frame_0001.webp",
    "/clinix-frames/frame_0001.jpg",
  ];

  for (const url of candidates) {
    try {
      await tryLoadFirstFrameUrl(url);
      const match = url.match(/frame_(\d+)\.(\w+)$/);
      const pad = match ? match[1].length : 4;
      const ext = match ? `.${match[2]}` : ".png";
      const totalFrames = await detectFrameCount(ext, pad);
      const frameUrls = Array.from(
        { length: totalFrames },
        (_, i) => `/clinix-frames/frame_${String(i + 1).padStart(pad, "0")}${ext}`
      );
      if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        console.log("[loadFrames] discovered", { firstFrameUrl: url, totalFrames, ext, pad });
      }
      return { firstFrameUrl: url, frameUrls, totalFrames };
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Detect frame count by trying to load frame_N until we get 404/error. Uses binary search or sequential try.
 * Simple approach: try up to 500 frames, stop when one fails.
 */
async function detectFrameCount(ext: string, pad: number): Promise<number> {
  let n = 0;
  const tryOne = (index: number) =>
    new Promise<boolean>((resolve) => {
      const url = `/clinix-frames/frame_${String(index).padStart(pad, "0")}${ext}`;
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });

  for (let i = 1; i <= 500; i++) {
    const ok = await tryOne(i);
    if (!ok) return i - 1;
    n = i;
  }
  return n;
}

/**
 * Preload all frame images. Loads first frame first, then the rest.
 * Logs every failed URL. Rejects with LoadFramesError if any fail (so we can show debug panel).
 */
export function preloadFrameImages(
  frameUrls: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<HTMLImageElement[]> {
  const loadOne = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
          console.log("[loadFrames] loaded:", src);
        }
        resolve(img);
      };
      img.onerror = () => {
        if (typeof window !== "undefined") {
          console.warn("[loadFrames] frame failed to load:", src);
        }
        reject(new Error(`Failed to load frame: ${src}`));
      };
      img.src = src;
    });

  if (frameUrls.length === 0) return Promise.resolve([]);

  // Load first frame first so we can draw immediately, then rest (collect all failures)
  return loadOne(frameUrls[0]).then((first) => {
    let loaded = 1;
    onProgress?.(loaded, frameUrls.length);
    const rest = frameUrls.slice(1);
    return Promise.allSettled(rest.map((src) => loadOne(src))).then((results) => {
      const images: HTMLImageElement[] = [first];
      const failedUrls: string[] = [];
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          images.push(r.value);
          loaded++;
          onProgress?.(loaded, frameUrls.length);
        } else {
          failedUrls.push(rest[i] ?? "");
        }
      });
      if (failedUrls.length > 0) {
        const error: LoadFramesError = {
          totalFrames: frameUrls.length,
          frameUrls,
          firstFrameUrl: frameUrls[0] ?? "",
          failedUrls,
          message: `Failed to load ${failedUrls.length} frame(s). First: ${failedUrls[0] ?? ""}`,
        };
        throw error;
      }
      return images;
    });
  });
}
