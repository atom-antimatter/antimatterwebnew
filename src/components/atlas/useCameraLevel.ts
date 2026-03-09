/**
 * useCameraLevel — Cesium camera zoom-level LOD hook.
 *
 * Listens to `viewer.camera.changed` and returns the current camera height,
 * LOD level, and visible viewport rectangle.  Updates are throttled to 150 ms
 * to avoid excessive React re-renders on every tiny camera movement.
 */
import { useEffect, useRef, useState } from "react";

// ─── types ────────────────────────────────────────────────────────────────────

export type CameraLevel = "WORLD" | "REGION" | "LOCAL" | "CITY";

export type CameraState = {
  height: number;
  level: CameraLevel;
  /** Null until the Cesium viewer has mounted and computed a view rectangle. */
  viewRect: {
    west: number;
    south: number;
    east: number;
    north: number;
  } | null;
};

// ─── thresholds (metres) ──────────────────────────────────────────────────────

const HEIGHT_WORLD = 10_000_000;  // > 10 000 km → no cities, clusters only
const HEIGHT_REGION = 3_500_000;  // 3.5–10 000 km → only top-tier metros
const HEIGHT_LOCAL = 900_000;     // 900 km–3 500 km → regional city labels
// below 900 km                   → CITY — viewport-only labels with higher density

function heightToLevel(h: number): CameraLevel {
  if (h > HEIGHT_WORLD) return "WORLD";
  if (h > HEIGHT_REGION) return "REGION";
  if (h > HEIGHT_LOCAL) return "LOCAL";
  return "CITY";
}

// ─── hook ─────────────────────────────────────────────────────────────────────

/**
 * @param viewerRef  A ref containing the Cesium.Viewer instance.
 *                   Can be null while the viewer is still mounting.
 */
export function useCameraLevel(
  viewerRef: React.RefObject<unknown>
): CameraState {
  const [state, setState] = useState<CameraState>({
    height: HEIGHT_WORLD + 1,
    level: "WORLD",
    viewRect: null,
  });

  const rafId = useRef<number | null>(null);
  const lastUpdateMs = useRef<number>(0);
  const THROTTLE_MS = 150;

  useEffect(() => {
    const viewer = viewerRef.current as any;
    if (!viewer) return;

    function readCamera() {
      if (viewer.isDestroyed?.()) return;
      const cam = viewer.camera;
      if (!cam) return;

      const height = cam.positionCartographic?.height ?? HEIGHT_WORLD + 1;
      const level = heightToLevel(height);

      // Compute viewport rectangle in degrees
      let viewRect: CameraState["viewRect"] = null;
      try {
        const rect = cam.computeViewRectangle?.();
        if (rect) {
          const toDeg = (r: number) => (r * 180) / Math.PI;
          viewRect = {
            west: toDeg(rect.west),
            south: toDeg(rect.south),
            east: toDeg(rect.east),
            north: toDeg(rect.north),
          };
        }
      } catch {
        // computeViewRectangle can throw when camera is underground
      }

      setState({ height, level, viewRect });
    }

    function onCameraChange() {
      const now = performance.now();
      if (now - lastUpdateMs.current < THROTTLE_MS) {
        // Defer to end of throttle window
        if (rafId.current !== null) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
          lastUpdateMs.current = performance.now();
          readCamera();
        });
        return;
      }
      lastUpdateMs.current = now;
      readCamera();
    }

    // Initial read
    readCamera();

    // Subscribe to Cesium camera changed event
    viewer.camera.changed.addEventListener(onCameraChange);
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      if (!viewer.isDestroyed?.()) {
        viewer.camera.changed.removeEventListener(onCameraChange);
      }
    };
  }, [viewerRef]);

  return state;
}
