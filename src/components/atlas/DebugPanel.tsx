"use client";
/**
 * DebugPanel — dev-only instrumentation overlay.
 * Enable: ?debug=1 in URL  OR  localStorage.atlasDebug = "true"
 * Toggle: Shift+D
 */
import { useEffect, useCallback, useState } from "react";
import { useAtlasLayersStore } from "@/state/atlasLayersStore";
import type { CameraState } from "./useCameraLevel";
import type { LayerStats } from "./layers/types";
import type { LayerManager } from "./layers/LayerManager";
import { heightToTileZoom, BASEMAP_MAX_LEVEL } from "@/lib/map/zoomEstimate";

type Props = {
  cameraState: CameraState;
  viewerReady: boolean;
  layerManager: React.RefObject<LayerManager | null>;
  viewerRef?: React.RefObject<unknown>;
};

function Row({ label, value, highlight }: {
  label: string;
  value: string | number | boolean | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2 text-[10px] leading-snug">
      <span className="text-[rgba(246,246,253,0.45)] shrink-0">{label}</span>
      <span className={`font-mono text-right ${highlight ? "text-[#fbbf24]" : "text-[rgba(246,246,253,0.85)]"} truncate`}>
        {value === null || value === undefined ? "n/a" : String(value)}
      </span>
    </div>
  );
}

export default function DebugPanel({ cameraState, viewerReady, layerManager, viewerRef }: Props) {
  const { debugEnabled, toggleDebug, overlays, power, providers, basemap } = useAtlasLayersStore();
  const [stats, setStats] = useState<Record<string, LayerStats>>({});
  const [sharpness, setSharpness] = useState<{
    dpr: number; scale: number; sse: number;
    canvasW: number; canvasH: number; cssW: number; cssH: number;
    fxaa: boolean;
  } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!debugEnabled) return;
    const id = setInterval(() => {
      const mgr = layerManager.current;
      if (mgr) setStats(mgr.getStats());
      const v = viewerRef?.current as any;
      if (v && !v.isDestroyed?.()) {
        const canvas = v.scene?.canvas as HTMLCanvasElement | undefined;
        setSharpness({
          dpr:    window.devicePixelRatio,
          scale:  v.resolutionScale ?? 1,
          sse:    v.scene?.globe?.maximumScreenSpaceError ?? 0,
          canvasW: canvas?.width  ?? 0,
          canvasH: canvas?.height ?? 0,
          cssW:   canvas?.clientWidth  ?? 0,
          cssH:   canvas?.clientHeight ?? 0,
          fxaa:   v.scene?.postProcessStages?.fxaa?.enabled ?? false,
        });
      }
      setTick(n => n + 1);
    }, 800);
    return () => clearInterval(id);
  }, [debugEnabled, layerManager, viewerRef]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.shiftKey && e.key === "D") toggleDebug();
  }, [toggleDebug]);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  if (!debugEnabled) return null;

  const rect     = cameraState.viewRect;
  const tileZoom = heightToTileZoom(cameraState.height, sharpness?.cssW ?? 1280);
  const maxLevel = BASEMAP_MAX_LEVEL[basemap] ?? 20;
  const overZoomed = tileZoom > maxLevel;
  const allToggles = { ...overlays, ...power, ...providers };
  const effectiveRatio = sharpness && sharpness.cssW > 0
    ? sharpness.canvasW / sharpness.cssW
    : null;

  return (
    <div className="fixed top-20 right-4 z-[999] w-[300px] rounded-xl bg-[rgba(2,3,8,0.93)] backdrop-blur-xl border border-[rgba(246,246,253,0.15)] shadow-2xl text-[11px] font-mono overflow-hidden pointer-events-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(246,246,253,0.08)] bg-[rgba(105,106,172,0.2)]">
        <span className="font-bold text-[#a2a3e9] uppercase tracking-wider text-[10px]">Atlas Debug</span>
        <button onClick={toggleDebug} className="text-[rgba(246,246,253,0.45)] hover:text-white transition-colors text-xs">x</button>
      </div>

      <div className="px-3 py-2 space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto">

        {/* Viewer / Sharpness */}
        <section>
          <p className="text-[9px] uppercase tracking-widest text-[rgba(162,163,233,0.7)] mb-1">Render / Sharpness</p>
          <Row label="viewerReady"      value={String(viewerReady)} highlight={!viewerReady} />
          <Row label="devicePixelRatio" value={typeof window !== "undefined" ? window.devicePixelRatio : "?"} />
          {sharpness && (
            <>
              <Row
                label="resolutionScale"
                value={sharpness.scale.toFixed(2)}
                highlight={sharpness.scale < sharpness.dpr * 0.9}
              />
              <Row label="SSE"           value={sharpness.sse.toFixed(1)} />
              <Row label="FXAA"          value={sharpness.fxaa ? "ON (blurs!)" : "off OK"} highlight={sharpness.fxaa} />
              <Row label="canvas px"     value={`${sharpness.canvasW}x${sharpness.canvasH}`} />
              <Row label="canvas css"    value={`${sharpness.cssW}x${sharpness.cssH}`} />
              {effectiveRatio !== null && (
                <Row
                  label="effective DPR"
                  value={effectiveRatio.toFixed(2)}
                  highlight={effectiveRatio < 1.5}
                />
              )}
            </>
          )}
        </section>

        {/* Tile zoom diagnostic */}
        <section>
          <p className="text-[9px] uppercase tracking-widest text-[rgba(162,163,233,0.7)] mb-1">Tiles</p>
          <Row label="basemap"          value={basemap} />
          <Row label="provider maxLevel" value={maxLevel} />
          <Row label="est. tile zoom"   value={tileZoom} />
          <Row
            label={overZoomed ? "WARNING: UPSCALING" : "zoom status"}
            value={overZoomed ? `z${tileZoom} > max${maxLevel} -> blurry!` : "within range OK"}
            highlight={overZoomed}
          />
        </section>

        {/* Camera */}
        <section>
          <p className="text-[9px] uppercase tracking-widest text-[rgba(162,163,233,0.7)] mb-1">Camera</p>
          <Row label="level"  value={cameraState.level} highlight />
          <Row label="height" value={`${(cameraState.height / 1000).toFixed(1)} km`} />
          {rect ? (
            <>
              <Row label="west/east"   value={`${rect.west.toFixed(1)} / ${rect.east.toFixed(1)}`} />
              <Row label="south/north" value={`${rect.south.toFixed(1)} / ${rect.north.toFixed(1)}`} />
            </>
          ) : <Row label="viewRect" value="null" highlight />}
        </section>

        {/* Layer toggles */}
        <section>
          <p className="text-[9px] uppercase tracking-widest text-[rgba(162,163,233,0.7)] mb-1">Toggles</p>
          {Object.entries(allToggles).map(([k, v]) => (
            <Row key={k} label={k} value={v ? "ON" : "off"} />
          ))}
        </section>

        {/* Layer stats */}
        <section>
          <p className="text-[9px] uppercase tracking-widest text-[rgba(162,163,233,0.7)] mb-1">Layer Stats</p>
          {Object.entries(stats).map(([name, s]) => (
            <div key={name} className="mb-1.5 border-l-2 border-[rgba(105,106,172,0.3)] pl-2">
              <div className="flex gap-1 items-center mb-0.5">
                <span className="text-[rgba(246,246,253,0.7)] text-[10px]">{name}</span>
                <span className={`${s.enabled ? "text-[#34d399]" : "text-[rgba(246,246,253,0.3)]"} text-[9px]`}>
                  {s.enabled ? "ON" : "off"}
                </span>
              </div>
              <Row label="entities"    value={s.entityCount} />
              <Row label="status"      value={s.fetchStatus} />
              {s.note      && <Row label="note"    value={s.note} />}
              {s.lastError && <Row label="error"   value={s.lastError} />}
              {s.lastUpdateAt && (
                <Row label="updated" value={`${((Date.now() - s.lastUpdateAt) / 1000).toFixed(1)}s ago`} />
              )}
            </div>
          ))}
          {Object.keys(stats).length === 0 && (
            <p className="text-[rgba(246,246,253,0.3)] text-[10px]">No layer stats yet</p>
          )}
        </section>

        <p className="text-[9px] text-[rgba(246,246,253,0.25)]">Shift+D close | tick={tick}</p>
      </div>
    </div>
  );
}
