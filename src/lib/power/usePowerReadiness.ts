"use client";
/**
 * usePowerReadiness — on-demand power feasibility fetch with force-reload.
 * Only fetches when `enabled` is true.
 */
import { useState, useEffect, useRef, useCallback } from "react";
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
  lat, lng, mw = 100, radiusKm = 80, enabled,
}: Options): {
  state: PowerReadinessState;
  trigger: (force?: boolean) => void;
  reload:  () => void;
} {
  const [state, setState] = useState<PowerReadinessState>({ status: "idle" });
  const abortRef   = useRef<AbortController | null>(null);
  const requestRef = useRef(0);

  const doFetch = useCallback((force = false) => {
    if (!lat || !lng) { setState({ status: "idle" }); return; }

    const key = cacheKey(lat, lng, mw, radiusKm);

    if (!force) {
      const hit = CACHE.get(key);
      if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
        setState({ status: "success", result: hit.result });
        return;
      }
    } else {
      // Force: evict client cache entry
      CACHE.delete(key);
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const myId = ++requestRef.current;

    setState({ status: "loading" });

    const url = force
      ? `/api/power/site?lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}&mw=${mw}&radiusKm=${radiusKm}&force=1`
      : `/api/power/site?lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}&mw=${mw}&radiusKm=${radiusKm}`;

    fetch(url, { signal: ctrl.signal })
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
  }, [lat, lng, mw, radiusKm]);

  useEffect(() => {
    if (!enabled) return;
    doFetch(false);
    return () => abortRef.current?.abort();
  }, [lat, lng, mw, radiusKm, enabled, doFetch]);

  // Reset to idle when target changes while NOT enabled
  useEffect(() => {
    if (!enabled) setState({ status: "idle" });
  }, [lat, lng, enabled]);

  return {
    state,
    trigger: (force = false) => doFetch(force),
    reload:  () => doFetch(true),
  };
}
