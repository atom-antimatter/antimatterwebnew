"use client";
/**
 * usePowerReadiness — on-demand power feasibility fetch.
 *
 * Only fetches when `enabled` is true.
 * Caches results in module-level memory by (lat, lng, mw, radius).
 */
import { useState, useEffect, useRef } from "react";
import type { PowerFeasibilityResult } from "@/lib/power/scorePowerFeasibility";

type CacheEntry = { result: PowerFeasibilityResult; at: number };
const CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function cacheKey(lat: number, lng: number, mw: number, radius: number): string {
  return `${(Math.round(lat * 10) / 10).toFixed(1)},${(Math.round(lng * 10) / 10).toFixed(1)},${mw},${radius}`;
}

export type PowerReadinessState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: PowerFeasibilityResult }
  | { status: "error"; message: string };

type Options = {
  lat: number | null;
  lng: number | null;
  mw?: number;
  radiusKm?: number;
  /** Only fetch when true — keep false until user requests it */
  enabled: boolean;
};

export function usePowerReadiness({
  lat,
  lng,
  mw = 100,
  radiusKm = 80,
  enabled,
}: Options): {
  state: PowerReadinessState;
  trigger: () => void; // manually re-fetch
} {
  const [state, setState] = useState<PowerReadinessState>({ status: "idle" });
  const abortRef   = useRef<AbortController | null>(null);
  const requestRef = useRef(0);

  const doFetch = () => {
    if (!lat || !lng) { setState({ status: "idle" }); return; }

    const key = cacheKey(lat, lng, mw, radiusKm);
    const hit = CACHE.get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      setState({ status: "success", result: hit.result });
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const myId = ++requestRef.current;

    setState({ status: "loading" });

    fetch(
      `/api/power/site?lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}&mw=${mw}&radiusKm=${radiusKm}`,
      { signal: ctrl.signal }
    )
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((result: PowerFeasibilityResult) => {
        if (myId !== requestRef.current) return;
        CACHE.set(key, { result, at: Date.now() });
        setState({ status: "success", result });
      })
      .catch((e: unknown) => {
        if ((e as Error).name === "AbortError") return;
        if (myId !== requestRef.current) return;
        setState({ status: "error", message: (e as Error).message ?? String(e) });
      });
  };

  useEffect(() => {
    if (!enabled) return;
    doFetch();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, mw, radiusKm, enabled]);

  return { state, trigger: doFetch };
}
