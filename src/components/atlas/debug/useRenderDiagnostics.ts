"use client";
/**
 * useRenderDiagnostics — polling hook that captures all render-quality metrics.
 * Only active when ?debug=1 or localStorage.atlasDebug === "1".
 */
import { useEffect, useRef, useState } from "react";
import { heightToTileZoom, BASEMAP_MAX_LEVEL } from "@/lib/map/zoomEstimate";
import { BASEMAP_CONFIGS, type BasemapId } from "@/lib/map/baseMaps";
import type { CameraState } from "../useCameraLevel";
import type { LayerStats } from "../layers/types";
import type { LayerManager } from "../layers/LayerManager";

export type MoveSource =
  | "free-nav"
  | "dc-selection"
  | "cluster-click"
  | "search-result"
  | "reset-view"
  | "suggestion";

export type CssDiagnostic = {
  selector: string;
  filter: string;
  backdropFilter: string;
  transform: string;
  opacity: string;
  willChange: string;
  suspicious: boolean;
};

export type TileDiagnostic = {
  basemapId: string;
  label: string;
  urlTemplate: string;
  maximumLevel: number;
  tileWidth: number;
  tileHeight: number;
  supportsRetina: boolean;
  retina: boolean;
  inferredZoom: number;
  overZoomed: boolean;
};

export type RenderSnapshot = {
  // Camera
  cameraHeight: number;
  cameraLevel: string;
  inferredTileZoom: number;
  moveSource: MoveSource;
  isSelected: boolean;
  // Canvas / DPR
  dpr: number;
  resolutionScale: number;
  useBrowserRecommended: boolean;
  canvasW: number;
  canvasH: number;
  cssW: number;
  cssH: number;
  effectiveRatio: number;
  underRendered: boolean;
  // Cesium render
  requestRenderMode: boolean;
  fxaa: boolean;
  msaaSamples: number;
  hdr: boolean;
  fogEnabled: boolean;
  sse: number;
  tileCacheSize: number;
  imageryLayerCount: number;
  // Basemap
  tile: TileDiagnostic | null;
  // CSS compositing
  cssAudit: CssDiagnostic[];
  // Layer stats
  layerStats: Record<string, LayerStats>;
  // 3D rendering
  terrainLoaded: boolean;
  shadowMapEnabled: boolean;
  primitiveCount: number;
  buildingsRendered: number;
  // Timestamps
  capturedAt: number;
};

export type RenderDiagnosticsState = {
  current: RenderSnapshot | null;
  freeNavSnapshot: RenderSnapshot | null;
  selectedSnapshot: RenderSnapshot | null;
};

function auditCss(canvas: HTMLElement | null): CssDiagnostic[] {
  if (!canvas || typeof window === "undefined") return [];
  const results: CssDiagnostic[] = [];
  let el: HTMLElement | null = canvas;
  while (el && el !== document.body) {
    const s = window.getComputedStyle(el);
    const filter = s.filter ?? "";
    const backdropFilter = s.backdropFilter ?? "";
    const transform = s.transform ?? "";
    const opacity = s.opacity ?? "";
    const willChange = s.willChange ?? "";
    const suspicious =
      (filter !== "" && filter !== "none") ||
      (backdropFilter !== "" && backdropFilter !== "none") ||
      (transform !== "" && transform !== "none" && !transform.startsWith("matrix(1,")) ||
      (opacity !== "" && parseFloat(opacity) < 1);
    if (suspicious) {
      results.push({
        selector: el.className ? `.${el.className.split(" ")[0]}` : el.tagName,
        filter, backdropFilter, transform, opacity, willChange, suspicious,
      });
    }
    el = el.parentElement;
  }
  return results;
}

export function useRenderDiagnostics(opts: {
  enabled: boolean;
  viewerRef: React.RefObject<unknown>;
  canvasContainerRef?: React.RefObject<HTMLElement | null>;
  layerManagerRef: React.RefObject<LayerManager | null>;
  cameraState: CameraState;
  basemap: BasemapId;
  moveSourceRef: React.MutableRefObject<MoveSource>;
  isSelectedRef: React.MutableRefObject<boolean>;
}): RenderDiagnosticsState {
  const {
    enabled, viewerRef, canvasContainerRef, layerManagerRef,
    cameraState, basemap, moveSourceRef, isSelectedRef,
  } = opts;

  const [state, setState] = useState<RenderDiagnosticsState>({
    current: null, freeNavSnapshot: null, selectedSnapshot: null,
  });

  const prevIsSelected = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const capture = (): RenderSnapshot => {
      const v = viewerRef.current as any;
      const canvas = v?.scene?.canvas as HTMLCanvasElement | undefined;
      const dpr = window.devicePixelRatio;
      const scale = v?.resolutionScale ?? 1;
      const cssW = canvas?.clientWidth ?? 0;
      const cssH = canvas?.clientHeight ?? 0;
      const canvasW = canvas?.width ?? 0;
      const canvasH = canvas?.height ?? 0;
      const effectiveRatio = cssW > 0 ? canvasW / cssW : 0;

      const bmCfg = BASEMAP_CONFIGS[basemap];
      const inferredZoom = heightToTileZoom(cameraState.height, cssW * scale || 1280);
      const maxLevel = BASEMAP_MAX_LEVEL[basemap] ?? bmCfg?.maximumLevel ?? 20;

      const tile: TileDiagnostic | null = bmCfg ? {
        basemapId: basemap,
        label: bmCfg.label,
        urlTemplate: bmCfg.urlTemplate ?? "(vector)",
        maximumLevel: bmCfg.maximumLevel,
        tileWidth: bmCfg.tileWidth ?? 512,
        tileHeight: bmCfg.tileHeight ?? 512,
        supportsRetina: bmCfg.supportsRetina ?? (bmCfg.type === "vector"),
        retina: dpr >= 1.5 && (bmCfg.supportsRetina ?? bmCfg.type === "vector"),
        inferredZoom,
        overZoomed: inferredZoom > maxLevel,
      } : null;

      const cssAudit = auditCss(canvasContainerRef?.current ?? canvas?.parentElement ?? null);
      const layerStats = layerManagerRef.current?.getStats() ?? {};
      const terrainProvider = v?.terrainProvider as { url?: string } | undefined;
      const terrainLoaded = !!(terrainProvider && "url" in terrainProvider && typeof terrainProvider.url === "string");
      const shadowMapEnabled = !!(v?.shadowMap?.enabled ?? (v?.scene as any)?.shadowMap?.enabled);
      const primitiveCount = (v?.scene?.primitives?.length ?? 0) as number;
      const buildingsRendered = layerStats.buildings?.entityCount ?? 0;

      return {
        cameraHeight: cameraState.height,
        cameraLevel: cameraState.level,
        inferredTileZoom: inferredZoom,
        moveSource: moveSourceRef.current,
        isSelected: isSelectedRef.current,
        dpr,
        resolutionScale: scale,
        useBrowserRecommended: !!(v as any)?.useBrowserRecommendedResolution,
        canvasW, canvasH, cssW, cssH,
        effectiveRatio,
        underRendered: effectiveRatio > 0 && effectiveRatio < dpr * 0.9,
        requestRenderMode: !!(v?.scene?.requestRenderMode),
        fxaa: !!(v?.scene?.postProcessStages?.fxaa?.enabled),
        msaaSamples: v?.scene?.msaaSamples ?? 1,
        hdr: !!(v?.scene?.highDynamicRange),
        fogEnabled: !!(v?.scene?.fog?.enabled),
        sse: v?.scene?.globe?.maximumScreenSpaceError ?? 0,
        tileCacheSize: v?.scene?.globe?.tileCacheSize ?? 0,
        imageryLayerCount: v?.imageryLayers?.length ?? 0,
        tile,
        cssAudit,
        layerStats,
        terrainLoaded,
        shadowMapEnabled,
        primitiveCount,
        buildingsRendered,
        capturedAt: Date.now(),
      };
    };

    const id = setInterval(() => {
      const snap = capture();
      const nowSelected = isSelectedRef.current;

      setState(prev => {
        const next: RenderDiagnosticsState = { ...prev, current: snap };
        if (nowSelected && !prevIsSelected.current) {
          // Just entered selected state — record both snapshots for comparison
          next.freeNavSnapshot = prev.freeNavSnapshot ?? prev.current;
          next.selectedSnapshot = snap;
          console.group("[Atlas Debug] Render state comparison: free-nav → selected");
          if (prev.current) {
            console.log("Height:", prev.current.cameraHeight.toFixed(0), "→", snap.cameraHeight.toFixed(0));
            console.log("Level:", prev.current.cameraLevel, "→", snap.cameraLevel);
            console.log("Inferred tile zoom:", prev.current.inferredTileZoom, "→", snap.inferredTileZoom);
            console.log("Over-zoomed before:", prev.current.tile?.overZoomed, "| after:", snap.tile?.overZoomed);
            console.log("SSE:", prev.current.sse.toFixed(2), "→", snap.sse.toFixed(2));
            console.log("effectiveRatio:", prev.current.effectiveRatio.toFixed(2), "→", snap.effectiveRatio.toFixed(2));
          }
          console.groupEnd();
        }
        prevIsSelected.current = nowSelected;
        return next;
      });
    }, 800);

    return () => clearInterval(id);
  }, [enabled, viewerRef, canvasContainerRef, layerManagerRef, cameraState, basemap, moveSourceRef, isSelectedRef]);

  return state;
}

/** Dev utility: fetch a tile for the current viewport and log quality metrics. */
export async function testTileFetch(basemap: BasemapId, zoom: number): Promise<void> {
  const cfg = BASEMAP_CONFIGS[basemap];
  if (!cfg) return;
  if (cfg.type === "vector") { console.log("[Atlas Debug] Vector basemap — no raster tile to fetch"); return; }
  const retina = window.devicePixelRatio >= 1.5 && cfg.supportsRetina && cfg.retinaTemplate;
  const tmpl = retina ? cfg.retinaTemplate! : (cfg.urlTemplate ?? "");
  const url = tmpl
    .replace("{s}", "a")
    .replace("{z}", String(Math.min(zoom, cfg.maximumLevel)))
    .replace("{x}", "0")
    .replace("{y}", "0");
  console.group("[Atlas Debug] Tile sample fetch");
  console.log("URL:", url);
  try {
    const r = await fetch(url);
    const blob = await r.blob();
    console.log("Status:", r.status);
    console.log("Content-Type:", r.headers.get("content-type"));
    console.log("Size:", (blob.size / 1024).toFixed(1), "KB");
    const bmp = await createImageBitmap(blob);
    console.log("Bitmap dimensions:", bmp.width, "×", bmp.height, retina ? "(expected 512)" : "(expected 256)");
    bmp.close();
  } catch (e) {
    console.error("Fetch failed:", e);
  }
  console.groupEnd();
}
