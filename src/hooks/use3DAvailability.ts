"use client";
/**
 * use3DAvailability — detects when the user is zoomed into a city
 * with sufficient building density to offer a 3D view.
 *
 * Monitors camera height and viewport. When height < 20km, queries
 * /api/buildings?countOnly=true to estimate building density. If count > 300,
 * sets is3DAvailable = true.
 */
import { useEffect, useRef, useState } from "react";
import type { CameraState } from "@/components/atlas/useCameraLevel";

const HEIGHT_THRESHOLD = 20_000; // only check when below 20km
const COUNT_THRESHOLD = 300;
const DEBOUNCE_MS = 600;

type ThreeDAvailability = {
  is3DAvailable: boolean;
  buildingCount: number;
  centerLat: number;
  centerLng: number;
  checking: boolean;
};

export function use3DAvailability(
  cameraState: CameraState,
  enabled: boolean,
): ThreeDAvailability {
  const [state, setState] = useState<ThreeDAvailability>({
    is3DAvailable: false,
    buildingCount: 0,
    centerLat: 0,
    centerLng: 0,
    checking: false,
  });

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBboxKey = useRef("");

  useEffect(() => {
    if (!enabled) return;

    if (cameraState.height > HEIGHT_THRESHOLD || !cameraState.viewRect) {
      if (state.is3DAvailable) {
        setState(s => ({ ...s, is3DAvailable: false, buildingCount: 0 }));
      }
      return;
    }

    const rect = cameraState.viewRect;
    const bboxKey = `${rect.west.toFixed(2)},${rect.south.toFixed(2)},${rect.east.toFixed(2)},${rect.north.toFixed(2)}`;
    if (bboxKey === lastBboxKey.current) return;
    lastBboxKey.current = bboxKey;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState(s => ({ ...s, checking: true }));

      const bbox = `${rect.west.toFixed(4)},${rect.south.toFixed(4)},${rect.east.toFixed(4)},${rect.north.toFixed(4)}`;
      fetch(`/api/buildings?bbox=${bbox}&countOnly=true`, { signal: controller.signal })
        .then(r => r.json())
        .then(data => {
          if (controller.signal.aborted) return;
          const count = data.count ?? 0;
          const centerLat = (rect.south + rect.north) / 2;
          const centerLng = (rect.west + rect.east) / 2;
          setState({
            is3DAvailable: count >= COUNT_THRESHOLD,
            buildingCount: count,
            centerLat,
            centerLng,
            checking: false,
          });
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setState(s => ({ ...s, checking: false }));
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, cameraState.height, cameraState.viewRect]);

  return state;
}
