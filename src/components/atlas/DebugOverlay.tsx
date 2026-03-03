"use client";

/**
 * DebugOverlay — developer-only layer diagnostics panel.
 *
 * Enable with:  ?debug=1  in the URL   OR   localStorage.atlasDebug = "true"
 * Toggle off:   press  Shift+D  or flip the store flag.
 */

import { useEffect, useState } from "react";
import { useAtlasLayersStore } from "@/state/atlasLayersStore";
import type { CameraState } from "./useCameraLevel";

type LayerCounts = {
  countryEntities: number;
  stateEntities: number;
  cityLabels: number;
  dcEntities: number;
  dcClusters: number;
  fiberSegments: number;
  heatmapCells: number;
  genPoints: number;
  queuePoints: number;
  linodePoints: number;
};

type Props = {
  cameraState: CameraState;
  /** Passed from AtlasMap so the overlay can read Cesium data sources */
  getLayerCounts: () => LayerCounts;
};

export default function DebugOverlay({ cameraState, getLayerCounts }: Props) {
  const { debugEnabled, toggleDebug, overlays, power, providers, basemap } =
    useAtlasLayersStore();
  const [counts, setCounts] = useState<LayerCounts | null>(null);
  const [tick, setTick] = useState(0);

  // Poll counts every second so numbers refresh as camera moves
  useEffect(() => {
    if (!debugEnabled) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [debugEnabled]);

  useEffect(() => {
    if (!debugEnabled) return;
    setCounts(getLayerCounts());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debugEnabled, tick]);

  // Shift+D toggles the overlay
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "D") toggleDebug();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleDebug]);

  if (!debugEnabled) return null;

  const rect = cameraState.viewRect;

  return (
    <div
      className="
        fixed top-20 right-4 z-[999] pointer-events-auto
        w-[280px] rounded-xl
        bg-[rgba(2,2,6,0.92)] backdrop-blur-xl
        border border-[rgba(246,246,253,0.15)]
        text-[11px] font-mono text-[rgba(246,246,253,0.85)]
        shadow-2xl overflow-hidden
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(246,246,253,0.08)] bg-[rgba(105,106,172,0.18)]">
        <span className="font-bold text-[#a2a3e9] uppercase tracking-wider">Atlas Debug</span>
        <button
          type="button"
          onClick={toggleDebug}
          className="text-[rgba(246,246,253,0.45)] hover:text-[#f6f6fd] transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="px-3 py-2 space-y-2">
        {/* Camera */}
        <section>
          <p className="text-[rgba(162,163,233,0.8)] uppercase tracking-wider mb-1">Camera</p>
          <p>Level: <span className="text-[#fbbf24]">{cameraState.level}</span></p>
          <p>Height: <span className="text-[#f6f6fd]">{(cameraState.height / 1000).toFixed(0)} km</span></p>
          {rect ? (
            <p className="text-[10px] text-[rgba(246,246,253,0.55)]">
              W{rect.west.toFixed(1)} S{rect.south.toFixed(1)} E{rect.east.toFixed(1)} N{rect.north.toFixed(1)}
            </p>
          ) : (
            <p className="text-[rgba(246,246,253,0.35)]">viewRect: null</p>
          )}
          <p>Basemap: <span className="text-[#34d399]">{basemap}</span></p>
        </section>

        {/* Overlay toggles */}
        <section>
          <p className="text-[rgba(162,163,233,0.8)] uppercase tracking-wider mb-1">Overlays</p>
          {Object.entries(overlays).map(([k, v]) => (
            <p key={k}>
              {v ? "✓" : "✗"} <span className={v ? "text-[#f6f6fd]" : "text-[rgba(246,246,253,0.35)]"}>{k}</span>
            </p>
          ))}
        </section>

        {/* Power toggles */}
        <section>
          <p className="text-[rgba(162,163,233,0.8)] uppercase tracking-wider mb-1">Power</p>
          {Object.entries(power).map(([k, v]) => (
            <p key={k}>
              {v ? "✓" : "✗"} <span className={v ? "text-[#f6f6fd]" : "text-[rgba(246,246,253,0.35)]"}>{k}</span>
            </p>
          ))}
          {Object.entries(providers).map(([k, v]) => (
            <p key={k}>
              {v ? "✓" : "✗"} <span className={v ? "text-[#34d399]" : "text-[rgba(246,246,253,0.35)]"}>{k}</span>
            </p>
          ))}
        </section>

        {/* Entity counts */}
        {counts && (
          <section>
            <p className="text-[rgba(162,163,233,0.8)] uppercase tracking-wider mb-1">Entity counts</p>
            <p>Country: {counts.countryEntities}</p>
            <p>States: {counts.stateEntities}</p>
            <p>City labels: {counts.cityLabels}</p>
            <p>DCs: {counts.dcEntities} pts / {counts.dcClusters} clusters</p>
            <p>Fiber segs: {counts.fiberSegments}</p>
            <p>Heatmap cells: {counts.heatmapCells}</p>
            <p>Generation: {counts.genPoints}</p>
            <p>Queue: {counts.queuePoints}</p>
            <p>Linode: {counts.linodePoints}</p>
          </section>
        )}

        <p className="text-[rgba(246,246,253,0.25)] text-[10px]">Shift+D to close · Shift+S for tile debug</p>
      </div>
    </div>
  );
}
