"use client";
/**
 * RenderDebugOverlay — comprehensive dev-only instrumentation panel.
 * Enable: ?debug=1 or localStorage.atlasDebug = "1"
 * Toggle: Shift+D
 */
import { useCallback, useEffect, type RefObject } from "react";
import { useAtlasLayersStore } from "@/state/atlasLayersStore";
import { useAtlasSelectionStore } from "@/state/atlasSelectionStore";
import type { CameraState } from "../useCameraLevel";
import type { LayerStats } from "../layers/types";
import type { LayerManager } from "../layers/LayerManager";
import type { BasemapId } from "@/lib/map/baseMaps";
import {
  useRenderDiagnostics, testTileFetch,
  type MoveSource,
} from "./useRenderDiagnostics";

type Props = {
  cameraState: CameraState;
  viewerReady: boolean;
  viewerRef: RefObject<unknown>;
  canvasContainerRef?: RefObject<HTMLElement | null>;
  layerManagerRef: RefObject<LayerManager | null>;
  moveSourceRef: React.MutableRefObject<MoveSource>;
  isSelectedRef: React.MutableRefObject<boolean>;
};

function Row({ label, value, warn }: { label: string; value: string | number | boolean | null | undefined; warn?: boolean }) {
  return (
    <div className="flex justify-between gap-2 text-[10px] leading-snug">
      <span className="text-[rgba(246,246,253,0.45)] shrink-0">{label}</span>
      <span className={`font-mono text-right truncate ${warn ? "text-[#fbbf24]" : "text-[rgba(246,246,253,0.85)]"}`}>
        {value === null || value === undefined ? "n/a" : String(value)}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-3">
      <p className="text-[9px] uppercase tracking-widest text-[rgba(162,163,233,0.7)] mb-1">{title}</p>
      {children}
    </section>
  );
}

function LayerRow({ name, stats }: { name: string; stats: LayerStats }) {
  return (
    <div className="mb-1.5 border-l-2 border-[rgba(105,106,172,0.3)] pl-2">
      <div className="flex gap-1 items-center mb-0.5">
        <span className="text-[rgba(246,246,253,0.7)] text-[10px]">{name}</span>
        <span className={`text-[9px] ${stats.enabled ? "text-[#34d399]" : "text-[rgba(246,246,253,0.3)]"}`}>
          {stats.enabled ? "ON" : "off"}
        </span>
      </div>
      <Row label="entities" value={stats.entityCount} />
      <Row label="status" value={stats.fetchStatus} warn={stats.fetchStatus === "error"} />
      {stats.note && <Row label="note" value={stats.note} />}
      {stats.lastError && <Row label="error" value={stats.lastError} warn />}
    </div>
  );
}

export default function RenderDebugOverlay({
  cameraState, viewerReady, viewerRef, canvasContainerRef,
  layerManagerRef, moveSourceRef, isSelectedRef,
}: Props) {
  const { debugEnabled, toggleDebug, basemap } = useAtlasLayersStore();
  const { filterDebug, is3DActive } = useAtlasSelectionStore();

  const diagState = useRenderDiagnostics({
    enabled: debugEnabled,
    viewerRef,
    canvasContainerRef,
    layerManagerRef,
    cameraState,
    basemap: basemap as BasemapId,
    moveSourceRef,
    isSelectedRef,
  });

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.shiftKey && e.key === "D") toggleDebug();
  }, [toggleDebug]);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  if (!debugEnabled) return null;

  const s = diagState.current;

  return (
    <div className="fixed top-20 right-4 z-[999] w-[320px] rounded-xl bg-[rgba(2,3,8,0.95)] backdrop-blur-xl border border-[rgba(246,246,253,0.15)] shadow-2xl text-[11px] font-mono overflow-hidden pointer-events-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(246,246,253,0.08)] bg-[rgba(105,106,172,0.2)]">
        <span className="font-bold text-[#a2a3e9] uppercase tracking-wider text-[10px]">Atlas Debug</span>
        <button onClick={toggleDebug} className="text-[rgba(246,246,253,0.45)] hover:text-white text-xs transition-colors">✕</button>
      </div>

      <div className="px-3 py-2 space-y-0 max-h-[calc(100vh-180px)] overflow-y-auto">
        {!viewerReady && <p className="text-[#fbbf24] text-[10px] py-2">Viewer not ready</p>}
        {!s ? <p className="text-[rgba(246,246,253,0.3)] text-[10px] py-2">Collecting…</p> : <>

        <Section title="Camera / Navigation">
          <Row label="height" value={`${(s.cameraHeight/1000).toFixed(1)} km`} />
          <Row label="level" value={s.cameraLevel} />
          <Row label="tile zoom est." value={s.inferredTileZoom} />
          <Row label="move source" value={s.moveSource} />
          <Row label="state" value={s.isSelected ? "selected DC" : "free-nav"} />
        </Section>

        <Section title="Canvas / DPR">
          <Row label="devicePixelRatio" value={s.dpr.toFixed(2)} />
          <Row label="resolutionScale" value={s.resolutionScale.toFixed(2)} warn={s.resolutionScale < s.dpr * 0.9} />
          <Row label="canvas px" value={`${s.canvasW}×${s.canvasH}`} />
          <Row label="canvas css" value={`${s.cssW}×${s.cssH}`} />
          <Row label="effective ratio" value={s.effectiveRatio.toFixed(2)} warn={s.underRendered} />
          {s.underRendered && <Row label="⚠ under-rendered" value={`want ${s.dpr.toFixed(1)}× got ${s.effectiveRatio.toFixed(1)}×`} warn />}
        </Section>

        <Section title="Cesium Render">
          <Row label="FXAA" value={s.fxaa ? "ON ⚠" : "off ✓"} warn={s.fxaa} />
          <Row label="HDR" value={s.hdr ? "ON ⚠" : "off ✓"} warn={s.hdr} />
          <Row label="fog" value={s.fogEnabled ? "ON" : "off"} />
          <Row label="SSE" value={s.sse.toFixed(2)} />
          <Row label="tileCache" value={s.tileCacheSize} />
          <Row label="imagery layers" value={s.imageryLayerCount} />
          <Row label="requestRenderMode" value={String(s.requestRenderMode)} />
          <Row label="MSAA samples" value={s.msaaSamples} />
        </Section>

        <Section title="3D Rendering">
          <Row label="terrain" value={s.terrainLoaded ? "loaded ✓" : "flat (fallback)"} />
          <Row label="shadow map" value={s.shadowMapEnabled ? "ON" : "off"} />
          <Row label="primitives" value={s.primitiveCount} />
          <Row label="buildings" value={s.buildingsRendered} />
          <Row label="camera height" value={`${(s.cameraHeight / 1000).toFixed(1)} km`} />
        </Section>

        <Section title="Basemap / Tiles">
          {s.tile ? <>
            <Row label="id" value={s.tile.basemapId} />
            <Row label="maxLevel" value={s.tile.maximumLevel} />
            <Row label="tileSize" value={`${s.tile.tileWidth}px`} />
            <Row label="retina" value={s.tile.retina ? "yes ✓" : "no"} />
            <Row label="inferred zoom" value={s.tile.inferredZoom} />
            <Row label="over-zoomed" value={s.tile.overZoomed ? "YES ⚠" : "no ✓"} warn={s.tile.overZoomed} />
          </> : <Row label="tile" value="no basemap config" />}
        </Section>

        {s.cssAudit.length > 0 && (
          <Section title="⚠ CSS Compositing Issues">
            {s.cssAudit.map((a, i) => (
              <div key={i} className="mb-1">
                <Row label="element" value={a.selector} warn />
                {a.filter !== "none" && <Row label="filter" value={a.filter} warn />}
                {a.backdropFilter !== "none" && <Row label="backdrop-filter" value={a.backdropFilter} warn />}
                {a.transform !== "none" && <Row label="transform" value={a.transform} warn />}
                {parseFloat(a.opacity) < 1 && <Row label="opacity" value={a.opacity} warn />}
              </div>
            ))}
          </Section>
        )}
        {s.cssAudit.length === 0 && (
          <Section title="CSS Compositing">
            <Row label="canvas parents" value="clean ✓" />
          </Section>
        )}

        <Section title="Layer Stats">
          {Object.keys(s.layerStats).length === 0
            ? <p className="text-[rgba(246,246,253,0.3)] text-[10px]">No layer stats</p>
            : Object.entries(s.layerStats).map(([n, ls]) => <LayerRow key={n} name={n} stats={ls} />)
          }
        </Section>

        {(diagState.freeNavSnapshot || diagState.selectedSnapshot) && (
          <Section title="A/B State Comparison">
            <Row label="free-nav height" value={diagState.freeNavSnapshot ? `${(diagState.freeNavSnapshot.cameraHeight/1000).toFixed(0)} km` : "—"} />
            <Row label="selected height" value={diagState.selectedSnapshot ? `${(diagState.selectedSnapshot.cameraHeight/1000).toFixed(0)} km` : "—"} />
            <Row label="free-nav zoom" value={diagState.freeNavSnapshot?.inferredTileZoom ?? "—"} />
            <Row label="selected zoom" value={diagState.selectedSnapshot?.inferredTileZoom ?? "—"} />
            <Row label="free-nav over-zoomed" value={diagState.freeNavSnapshot?.tile?.overZoomed ? "YES ⚠" : "no"} warn={!!diagState.freeNavSnapshot?.tile?.overZoomed} />
            <Row label="selected over-zoomed" value={diagState.selectedSnapshot?.tile?.overZoomed ? "YES ⚠" : "no"} warn={!!diagState.selectedSnapshot?.tile?.overZoomed} />
          </Section>
        )}

        <Section title="Filter Pipeline">
          <Row label="mode" value={filterDebug.mode} />
          <Row label="query" value={filterDebug.rawQuery || "(none)"} />
          <Row label="geocodedPos" value={filterDebug.geocodedPos ? `${filterDebug.geocodedPos.lat.toFixed(2)}, ${filterDebug.geocodedPos.lng.toFixed(2)}` : "none"} />
          <Row label="capabilities" value={filterDebug.capabilities.length > 0 ? filterDebug.capabilities.join(", ") : "(none)"} />
          <Row label="tier" value={filterDebug.tier ?? "(all)"} />
          <Row label="results" value={filterDebug.resultCount} />
        </Section>

        <Section title="Dev Actions">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                const v = viewerRef.current as any;
                v?.scene?.requestRender();
                console.log("[Atlas Debug] force requestRender");
              }}
              className="px-2 py-1 text-[10px] rounded-md bg-[rgba(105,106,172,0.18)] border border-[rgba(105,106,172,0.3)] text-[rgba(162,163,233,0.9)] hover:bg-[rgba(105,106,172,0.3)] transition-colors"
            >
              Force Render
            </button>
            <button
              type="button"
              onClick={() => {
                const v = viewerRef.current as any;
                const c = v?.scene?.canvas;
                console.group("[Atlas Debug] Canvas metrics");
                console.log("clientWidth:", c?.clientWidth, "clientHeight:", c?.clientHeight);
                console.log("width:", c?.width, "height:", c?.height);
                console.log("ratio:", c ? (c.width / c.clientWidth).toFixed(2) : "n/a");
                console.log("resolutionScale:", v?.resolutionScale);
                console.log("DPR:", window.devicePixelRatio);
                console.groupEnd();
              }}
              className="px-2 py-1 text-[10px] rounded-md bg-[rgba(105,106,172,0.18)] border border-[rgba(105,106,172,0.3)] text-[rgba(162,163,233,0.9)] hover:bg-[rgba(105,106,172,0.3)] transition-colors"
            >
              Dump Canvas
            </button>
            <button
              type="button"
              onClick={() => testTileFetch(basemap as BasemapId, s?.inferredTileZoom ?? 6)}
              className="px-2 py-1 text-[10px] rounded-md bg-[rgba(105,106,172,0.18)] border border-[rgba(105,106,172,0.3)] text-[rgba(162,163,233,0.9)] hover:bg-[rgba(105,106,172,0.3)] transition-colors"
            >
              Test Tile
            </button>
          </div>
        </Section>

        <Section title="3D Availability">
          <Row label="camera height" value={`${(cameraState.height / 1000).toFixed(1)} km`} />
          <Row label="is3DActive" value={String(is3DActive)} warn={is3DActive} />
          {cameraState.viewRect && (
            <Row label="bbox" value={`${cameraState.viewRect.west.toFixed(1)},${cameraState.viewRect.south.toFixed(1)},${cameraState.viewRect.east.toFixed(1)},${cameraState.viewRect.north.toFixed(1)}`} />
          )}
        </Section>

        <p className="text-[9px] text-[rgba(246,246,253,0.25)] pt-1">Shift+D to close</p>
        </>}
      </div>
    </div>
  );
}
