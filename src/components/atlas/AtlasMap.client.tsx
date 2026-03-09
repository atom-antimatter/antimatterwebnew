/**
 * AtlasMap — CesiumJS-based Infrastructure Atlas map.
 *
 * Architecture:
 *  - One LayerManager instance (in a ref) owns all Cesium layer lifecycle.
 *  - React effects call manager.sync() and manager.onCameraChange().
 *  - requestRender() is centralised in the manager.
 *  - No scattered per-layer useEffect — one sync() call covers everything.
 */
"use client";

if (typeof window !== "undefined") {
  (window as any).CESIUM_BASE_URL = "/cesium";
}

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import * as Cesium from "cesium";

import { DATA_CENTERS, type DataCenter } from "@/data/dataCenters";
import { useCameraLevel }    from "./useCameraLevel";
import RenderDebugOverlay    from "./debug/RenderDebugOverlay";
import type { MoveSource }   from "./debug/useRenderDiagnostics";
import { LayerManager }      from "./layers/LayerManager";
import { CountryBordersLayer } from "./layers/CountryBordersLayer";
import { StateBordersLayer }   from "./layers/StateBordersLayer";
import { CityLabelsLayer }     from "./layers/CityLabelsLayer";
import { FiberRoutesLayer }    from "./layers/FiberRoutesLayer";
import { FeasibilityHeatmapLayer } from "./layers/FeasibilityHeatmapLayer";
import { BuildingsLayer }         from "./layers/BuildingsLayer";
import type { LayerContext } from "./layers/types";
import type { ProviderRegion } from "@/lib/providers/linode/types";
import { getMinimumZoomDistance, heightToTileZoom, BASEMAP_MAX_LEVEL } from "@/lib/map/zoomEstimate";
import { useAtlasSelectionStore } from "@/state/atlasSelectionStore";

// ─── exported types ────────────────────────────────────────────────────────

Cesium.Ion.defaultAccessToken = "";

import type { BasemapId } from "@/lib/map/baseMaps";
export type Basemap = BasemapId;

export type AtlasLayers = {
  countryBorders: boolean;
  stateBorders:   boolean;
  cities:         boolean;
  points:         boolean;
  routes:         boolean;
  powerHeatmap:   boolean;
  powerGeneration:boolean;
  powerQueue:     boolean;
  linodeRegions:  boolean;
};

export type AtlasMapRef = {
  flyTo:           (pos: { lat: number; lng: number; height?: number }, dur?: number) => void;
  resetView:       () => void;
  getCameraCenter: () => { lat: number; lng: number } | null;
  pinCenter:       (cb: (lat: number, lng: number) => void) => void;
  getCameraHeight: () => number;
  getViewRect:     () => { west: number; south: number; east: number; north: number } | null;
  enter3DMode:     (centerLat: number, centerLng: number) => void;
  exit3DMode:      () => void;
};

export type PowerScenario = { targetMw: number; radiusKm: number };

type AtlasMapProps = {
  selectedId?:      string | null;
  onSelectDc?:      (dc: DataCenter | null) => void;
  highlightIds?:    string[] | null;
  layers:           AtlasLayers;
  basemap:          Basemap;
  powerScenario?:   PowerScenario;
  onMapClick?:      (lat: number, lng: number) => void;
  onSelectLinode?:  (r: ProviderRegion | null) => void;
  selectedLinodeId?:string | null;
  is3DActive?:      boolean;
};

type Tooltip = { x: number; y: number; dc: DataCenter } | null;

// ─── imagery ──────────────────────────────────────────────────────────────

import { BASEMAP_CONFIGS } from "@/lib/map/baseMaps";
import { createVectorProvider, type VectorStyleId } from "@/lib/map/vectorBasemap";

const RETINA = typeof window !== "undefined" && window.devicePixelRatio >= 1.5;

function makeRasterProvider(basemapId: Basemap): Cesium.ImageryProvider {
  const cfg = BASEMAP_CONFIGS[basemapId] ?? BASEMAP_CONFIGS.osmDark;
  const useRetina = RETINA && cfg.supportsRetina && cfg.retinaTemplate;
  const url = useRetina ? cfg.retinaTemplate! : cfg.urlTemplate!;
  const tw = useRetina ? (cfg.retinaTileWidth ?? 512) : (cfg.tileWidth ?? 256);
  const th = useRetina ? (cfg.retinaTileHeight ?? 512) : (cfg.tileHeight ?? 256);
  return new Cesium.UrlTemplateImageryProvider({
    url,
    minimumLevel: cfg.minimumLevel,
    maximumLevel: cfg.maximumLevel,
    tileWidth: tw,
    tileHeight: th,
    ...((cfg.subdomains ?? []).length > 0 ? { subdomains: cfg.subdomains } : {}),
    credit: new Cesium.Credit(cfg.credit),
  });
}

function isVectorBasemap(id: Basemap): boolean {
  return (BASEMAP_CONFIGS[id]?.type ?? "raster") === "vector";
}

function isLight(b: Basemap) { return b === "osmLight" || b === "osmStandard" || b === "vectorLight" || b === "vectorLiberty"; }

function tierSize(t: DataCenter["tier"]) { return t==="hyperscale"?13:t==="core"?10:t==="enterprise"?9:8; }
function tierColor(t: DataCenter["tier"], light=false): Cesium.Color {
  if (light) { switch(t) { case "hyperscale":return Cesium.Color.fromCssColorString("#3e3f7e").withAlpha(0.95); case "core":return Cesium.Color.fromCssColorString("#4c4dac").withAlpha(0.93); default:return Cesium.Color.fromCssColorString("#4c4dac").withAlpha(0.88); } }
  switch(t) { case "hyperscale":return Cesium.Color.fromCssColorString("#8587e3").withAlpha(0.97); case "core":return Cesium.Color.fromCssColorString("#a2a3e9").withAlpha(0.93); case "enterprise":return Cesium.Color.fromCssColorString("#c7c8f2").withAlpha(0.88); case "edge":return Cesium.Color.fromCssColorString("#696aac").withAlpha(0.9); default:return Cesium.Color.fromCssColorString("#a2a3e9").withAlpha(0.85); }
}

// ─── component ────────────────────────────────────────────────────────────

const AtlasMap = forwardRef<AtlasMapRef, AtlasMapProps>(
  ({ selectedId, onSelectDc, highlightIds, layers, basemap, powerScenario, onMapClick, onSelectLinode, selectedLinodeId, is3DActive }, ref) => {

  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef    = useRef<Cesium.Viewer | null>(null);
  const managerRef   = useRef<LayerManager | null>(null);

  // DC data source (not managed by LayerManager — simpler because it never changes)
  const dcSourceRef       = useRef<Cesium.CustomDataSource | null>(null);
  const celestialSourceRef = useRef<Cesium.CustomDataSource | null>(null);
  const linodeSourceRef   = useRef<Cesium.CustomDataSource | null>(null);
  const linodeReqId     = useRef(0);
  const powerGenReqId   = useRef(0);
  const powerQueueReqId = useRef(0);
  const powerGenRef     = useRef<Cesium.CustomDataSource | null>(null);
  const powerQueueRef   = useRef<Cesium.CustomDataSource | null>(null);

  const basemapRef      = useRef<Basemap>(basemap);
  const moveSourceRef   = useRef<MoveSource>("free-nav");
  const isSelectedRef   = useRef(false);

  const { setCameraLevel } = useAtlasSelectionStore();

  const [tooltip,   setTooltip]   = useState<Tooltip>(null);
  const [isReady,   setIsReady]   = useState(false);
  const cameraState = useCameraLevel(viewerRef);

  // Refs used by both useImperativeHandle and effects for 3D mode
  const buildingsLayerRef = useRef<BuildingsLayer | null>(null);
  const makeCtxRef = useRef<(() => LayerContext) | null>(null);

  // Helper: current managed layer states (read from latest props via closure)
  const layersRef = useRef(layers);
  layersRef.current = layers;
  const getManagedStates = (): Record<string, boolean> => ({
    countryBorders: layersRef.current.countryBorders,
    stateBorders:   layersRef.current.stateBorders,
    cities:         layersRef.current.cities,
    routes:         layersRef.current.routes,
    powerHeatmap:   layersRef.current.powerHeatmap,
  });

  // Keep basemapRef current so the makeCtx factory always reads the latest value
  useEffect(() => { basemapRef.current = basemap; }, [basemap]);

  // Sync camera level to the selection store so LayersMenu can read it
  useEffect(() => { setCameraLevel(cameraState.level); }, [cameraState.level, setCameraLevel]);

  // Celestial bodies: show when zoomed out (planets "come into orbit")
  const CELESTIAL_VISIBLE_HEIGHT = 14_000_000;
  useEffect(() => {
    const src = celestialSourceRef.current;
    if (!src) return;
    src.show = cameraState.height >= CELESTIAL_VISIBLE_HEIGHT;
    viewerRef.current?.scene.requestRender();
  }, [cameraState.height]);

  // ── Expose flyTo / resetView ─────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    flyTo: (pos, dur=1.5) => {
      const v = viewerRef.current;
      if (!v||v.isDestroyed()) return;
      v.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat, pos.height ?? 1_500_000),
        duration: dur,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
        complete: () => { v.scene.requestRender(); },
      });
    },
    resetView: () => {
      const v = viewerRef.current;
      if (!v||v.isDestroyed()) return;
      moveSourceRef.current = "reset-view";
      v.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(-20,25,18_000_000), duration: 2, easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT });
    },
    getCameraCenter: () => {
      const v = viewerRef.current;
      if (!v||v.isDestroyed()) return null;
      const carto = v.camera.positionCartographic;
      return { lat: Cesium.Math.toDegrees(carto.latitude), lng: Cesium.Math.toDegrees(carto.longitude) };
    },
    pinCenter: (cb) => {
      const v = viewerRef.current;
      if (!v||v.isDestroyed()) return;
      const carto = v.camera.positionCartographic;
      cb(Cesium.Math.toDegrees(carto.latitude), Cesium.Math.toDegrees(carto.longitude));
    },
    getCameraHeight: () => {
      const v = viewerRef.current;
      if (!v||v.isDestroyed()) return 18_000_000;
      return v.camera.positionCartographic?.height ?? 18_000_000;
    },
    getViewRect: () => {
      const v = viewerRef.current;
      if (!v||v.isDestroyed()) return null;
      try {
        const r = v.camera.computeViewRectangle?.();
        if (!r) return null;
        const toDeg = (val: number) => (val * 180) / Math.PI;
        return { west: toDeg(r.west), south: toDeg(r.south), east: toDeg(r.east), north: toDeg(r.north) };
      } catch { return null; }
    },
    enter3DMode: (centerLat: number, centerLng: number) => {
      const v = viewerRef.current;
      const mgr = managerRef.current;
      if (!v || v.isDestroyed() || !mgr) return;

      // Enable 3D scene features
      v.scene.globe.depthTestAgainstTerrain = true;
      v.scene.globe.enableLighting = true;
      v.shadows = true;
      if (v.shadowMap) v.shadowMap.enabled = true;
      v.scene.light = new Cesium.SunLight();
      if (v.scene.skyAtmosphere) v.scene.skyAtmosphere.show = true;

      // Register BuildingsLayer if not already
      if (!buildingsLayerRef.current) {
        const bl = new BuildingsLayer();
        buildingsLayerRef.current = bl;
        mgr.register(bl);
      }

      // Fly to city altitude, then sync buildings after arrival
      v.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(centerLng, centerLat, 2500),
        duration: 1.5,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
        complete: () => {
          if (v.isDestroyed()) return;
          // Force a fresh sync now that camera is at 2500m
          const ctx = makeCtxRef.current?.();
          if (ctx) {
            mgr.sync({ ...getManagedStates(), buildings: true }, ctx);
          }
          v.scene.requestRender();
        },
      });
    },
    exit3DMode: () => {
      const v = viewerRef.current;
      const mgr = managerRef.current;
      if (!v || v.isDestroyed()) return;

      // Revert 3D features
      v.scene.globe.depthTestAgainstTerrain = false;
      v.scene.globe.enableLighting = false;
      v.shadows = false;
      if (v.shadowMap) v.shadowMap.enabled = false;
      if (v.scene.skyAtmosphere) v.scene.skyAtmosphere.show = false;

      // Disable buildings in the layer sync
      if (mgr) {
        const ctx = makeCtxRef.current?.();
        if (ctx) mgr.sync({ ...getManagedStates(), buildings: false }, ctx);
      }
      v.scene.requestRender();
    },
  }), []);

  // ── Init viewer + LayerManager ───────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container || viewerRef.current) return;

    const viewer = new Cesium.Viewer(container, {
      animation:false, baseLayerPicker:false, fullscreenButton:false,
      geocoder:false, homeButton:false, infoBox:false,
      navigationHelpButton:false, navigationInstructionsInitiallyVisible:false,
      sceneModePicker:false, selectionIndicator:false, timeline:false, vrButton:false,
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    });

    (viewer.cesiumWidget as any)._creditContainer.style.display = "none";
    viewer.scene.globe.baseColor           = Cesium.Color.fromCssColorString("#1a1b2e");
    viewer.scene.globe.depthTestAgainstTerrain = false;
    viewer.scene.globe.enableLighting      = false;
    viewer.scene.globe.showGroundAtmosphere = false;
    viewer.scene.globe.preloadAncestors    = true;
    viewer.scene.globe.preloadSiblings     = true;
    viewer.scene.globe.tileCacheSize       = 2000;

    // FXAA applies a blur kernel over the whole frame — disabling it is the
    // single most impactful change for text / label crispness.
    viewer.scene.postProcessStages.fxaa.enabled = false;

    // Force Cesium to honour our resolutionScale (not "browser recommended").
    (viewer as any).useBrowserRecommendedResolution = false;
    viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 2);

    // Fog and HDR both soften the image.
    viewer.scene.fog.enabled = false;
    viewer.scene.highDynamicRange = false;

    // Reduce GPU load when idle; layers call requestRender() on updates
    viewer.scene.requestRenderMode = true;

    const ctrl = viewer.scene.screenSpaceCameraController;
    // Carto maxLevel=20 → min height ≈ 140m. Add 30% margin → 182m.
    // This prevents us from ever zooming past the tile provider's max level
    // and upscaling blurry tiles.
    ctrl.minimumZoomDistance = 200;
    // Allow zooming out to see Moon (~384M m) and beyond for orbit view
    ctrl.maximumZoomDistance = 500_000_000;

    if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = false;
    if (viewer.scene.skyBox) (viewer.scene.skyBox as any).show = false;
    if (viewer.scene.sun)  viewer.scene.sun.show  = false;
    if (viewer.scene.moon) viewer.scene.moon.show = false;
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#020202");

    // Always start with raster (instant render). The basemap swap effect
    // will upgrade to vector if the store says vectorDark/Light/Liberty.
    viewer.imageryLayers.addImageryProvider(makeRasterProvider("osmDark"));
    viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(-20, 25, 18_000_000) });

    const canvas = viewer.scene.canvas;
    // Prevent wheel from bubbling past the map (stops page scroll) — bubble phase
    // so Cesium's own handler fires first for zoom.
    canvas.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true });
    // Block touch-based page navigation (pull-to-refresh, swipe-back, pinch-zoom
    // of the page) so all gestures go to Cesium instead.
    canvas.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    // Resize / DPR — also poll every 2s for Mac display changes that shift DPR
    const onResize = () => {
      if (!viewer.isDestroyed()) {
        viewer.resize();
        viewer.resolutionScale = Math.min(window.devicePixelRatio||1, 2);
        viewer.scene.requestRender();
      }
    };
    window.addEventListener("resize", onResize);
    let lastDPR = window.devicePixelRatio;
    const dprPollId = setInterval(() => {
      if (!viewer.isDestroyed() && window.devicePixelRatio !== lastDPR) {
        lastDPR = window.devicePixelRatio;
        viewer.resolutionScale = Math.min(lastDPR, 2);
        viewer.resize();
        viewer.scene.requestRender();
      }
    }, 1500);

    // Debug shortcut
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "S") {
        const v = viewerRef.current; if (!v||v.isDestroyed()) return;
        console.group("[Atlas] debug"); console.log("DPR:", window.devicePixelRatio); console.log("resolutionScale:", v.resolutionScale); console.log("SSE:", v.scene.globe.maximumScreenSpaceError); console.groupEnd();
      }
    };
    window.addEventListener("keydown", onKey);

    viewerRef.current = viewer;

    // ── Layer Manager ──────────────────────────────────────────────────────
    const mgr = new LayerManager();
    mgr.register(new CountryBordersLayer());
    mgr.register(new StateBordersLayer());
    mgr.register(new CityLabelsLayer());
    mgr.register(new FiberRoutesLayer());
    mgr.register(new FeasibilityHeatmapLayer());
    managerRef.current = mgr;

    const makeCtx = (): LayerContext => {
      const cam = viewer.camera;
      const h = cam.positionCartographic?.height ?? 18_000_000;
      let viewRect: LayerContext["viewRect"] = null;
      try {
        const r = cam.computeViewRectangle?.();
        if (r) {
          const toDeg = (v: number) => (v * 180) / Math.PI;
          viewRect = { west: toDeg(r.west), south: toDeg(r.south), east: toDeg(r.east), north: toDeg(r.north) };
        }
      } catch { /* underground camera */ }
      const level = h > 10_000_000 ? "WORLD" : h > 3_500_000 ? "REGION" : h > 900_000 ? "LOCAL" : "CITY";
      return { viewer, cameraLevel: level as LayerContext["cameraLevel"], viewRect, heightMeters: h, basemap: basemapRef.current };
    };
    mgr.init(viewer, makeCtx);
    makeCtxRef.current = makeCtx;

    // ── DC markers ────────────────────────────────────────────────────────
    const dcDs = new Cesium.CustomDataSource("data-centers");
    dcSourceRef.current = dcDs;
    dcDs.clustering.enabled = true;
    dcDs.clustering.pixelRange = 45;
    dcDs.clustering.minimumClusterSize = 3;
    dcDs.clustering.clusterEvent.addEventListener((clustered: Cesium.Entity[], cluster: any) => {
      cluster.label.show = false;
      cluster.billboard.show = true;
      cluster.billboard.image = makeClusterCanvas(clustered.length);
      cluster.billboard.scale = 1;
      cluster.billboard.verticalOrigin   = Cesium.VerticalOrigin.CENTER;
      cluster.billboard.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
      cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
    });
    DATA_CENTERS.forEach(dc => {
      const e = dcDs.entities.add({ position: Cesium.Cartesian3.fromDegrees(dc.lng, dc.lat), point: new Cesium.PointGraphics({ pixelSize: tierSize(dc.tier), color: tierColor(dc.tier), outlineColor: Cesium.Color.BLACK.withAlpha(0.4), outlineWidth: 1, disableDepthTestDistance: Number.POSITIVE_INFINITY, scaleByDistance: new Cesium.NearFarScalar(200_000,1.4,8_000_000,0.7) }) });
      (e as any).dcData = dc;
    });
    viewer.dataSources.add(dcDs);

    // ── Celestial bodies (realistic sizes; Earth = globe). Visible when zoomed out ─
    const EARTH_RADIUS_M = 6_371_000;
    const celestialDs = new Cesium.CustomDataSource("celestial");
    celestialSourceRef.current = celestialDs;
    // Moon: real distance 384,400 km, radius 1,737 km
    const moonHeight = 384_400_000 - EARTH_RADIUS_M;
    celestialDs.entities.add({
      name: "Moon",
      position: Cesium.Cartesian3.fromDegrees(0, 0, moonHeight),
      ellipsoid: {
        radii: new Cesium.Cartesian3(1_737_000, 1_737_000, 1_737_000),
        material: Cesium.Color.fromCssColorString("#c0c0c5"),
        outline: false,
      },
    });
    // Venus: compressed distance for orbit view; real radius 6,052 km
    const venusHeight = 420_000_000 - EARTH_RADIUS_M;
    celestialDs.entities.add({
      name: "Venus",
      position: Cesium.Cartesian3.fromDegrees(120, 5, venusHeight),
      ellipsoid: {
        radii: new Cesium.Cartesian3(6_052_000, 6_052_000, 6_052_000),
        material: Cesium.Color.fromCssColorString("#e6c229"),
        outline: false,
      },
    });
    // Mars: compressed distance; real radius 3,390 km
    const marsHeight = 480_000_000 - EARTH_RADIUS_M;
    celestialDs.entities.add({
      name: "Mars",
      position: Cesium.Cartesian3.fromDegrees(-80, -10, marsHeight),
      ellipsoid: {
        radii: new Cesium.Cartesian3(3_390_000, 3_390_000, 3_390_000),
        material: Cesium.Color.fromCssColorString("#c1440e"),
        outline: false,
      },
    });
    celestialDs.show = false;
    viewer.dataSources.add(celestialDs);

    // ── Interaction handler ────────────────────────────────────────────────
    const handler = new Cesium.ScreenSpaceEventHandler(canvas);

    /** Zoom 55% closer toward a cluster centroid (Google Maps-style). */
    function zoomIntoCluster(entity: Cesium.Entity) {
      const pos = entity.position?.getValue(Cesium.JulianDate.now());
      if (!pos) return;
      const carto  = Cesium.Cartographic.fromCartesian(pos);
      const lat    = Cesium.Math.toDegrees(carto.latitude);
      const lng    = Cesium.Math.toDegrees(carto.longitude);
      const curH   = viewer.camera.positionCartographic.height;
      const newH   = Math.max(curH * 0.45, 60_000); // zoom in 55%, min 60km (crisp CITY band)
      moveSourceRef.current = "cluster-click";
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lng, lat, newH),
        duration: 0.8,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
        complete: () => { viewer.scene.requestRender(); },
      });
    }

    handler.setInputAction((ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const picked = viewer.scene.pick(ev.position);

      if (picked?.id?.dcData) {
        moveSourceRef.current = "dc-selection";
        isSelectedRef.current = true;
        onSelectDc?.(picked.id.dcData as DataCenter);
        onSelectLinode?.(null);
      } else if (picked?.id?.linodeData) {
        onSelectLinode?.(picked.id.linodeData as ProviderRegion);
        onSelectDc?.(null);
        setTooltip(null);
      } else if (
        // Cluster entity: auto-generated by Cesium, has billboard but no dcData/linodeData
        picked?.id instanceof Cesium.Entity &&
        !(picked.id as any).dcData &&
        !(picked.id as any).linodeData
      ) {
        zoomIntoCluster(picked.id as Cesium.Entity);
      } else {
        moveSourceRef.current = "free-nav";
        isSelectedRef.current = false;
        onSelectDc?.(null); onSelectLinode?.(null); setTooltip(null);
        if (onMapClick) {
          const cart = viewer.camera.pickEllipsoid(ev.position, viewer.scene.globe.ellipsoid);
          if (cart) {
            const c = Cesium.Cartographic.fromCartesian(cart);
            onMapClick(Cesium.Math.toDegrees(c.latitude), Cesium.Math.toDegrees(c.longitude));
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((ev: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      const picked = viewer.scene.pick(ev.endPosition);
      if (picked?.id?.dcData) {
        setTooltip({ x: ev.endPosition.x, y: ev.endPosition.y, dc: picked.id.dcData as DataCenter });
        canvas.style.cursor = "pointer";
      } else if (picked?.id?.linodeData) {
        const r = picked.id.linodeData as ProviderRegion;
        setTooltip({ x: ev.endPosition.x, y: ev.endPosition.y, dc: { name:r.label, city:r.city??'', stateOrRegion:r.metro??undefined, country:r.country??'', capabilities:r.capabilities } as DataCenter });
        canvas.style.cursor = "pointer";
      } else if (
        picked?.id instanceof Cesium.Entity &&
        !(picked.id as any).dcData &&
        !(picked.id as any).linodeData
      ) {
        // Hovering a cluster
        setTooltip(null);
        canvas.style.cursor = "zoom-in";
      } else {
        setTooltip(null);
        canvas.style.cursor = "default";
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    setIsReady(true);

    if (process.env.NODE_ENV === "development") {
      (window as any).__atlas = {
        logTileSample: () => {
          const v = viewerRef.current;
          if (!v || v.isDestroyed()) { console.warn("Viewer not ready"); return; }
          const h = v.camera.positionCartographic.height;
          const cw = v.scene.canvas.clientWidth * (v.resolutionScale ?? 1);
          const z = heightToTileZoom(h, cw);
          const cfg = BASEMAP_CONFIGS[basemapRef.current as BasemapId] ?? BASEMAP_CONFIGS.osmDark;
          const maxLvl = cfg.maximumLevel;
          const overZoomed = z > maxLvl;
          const useRetina = RETINA && cfg.supportsRetina && cfg.retinaTemplate;
          const tmpl = useRetina ? cfg.retinaTemplate! : (cfg.urlTemplate ?? "");
          const tileUrl = tmpl
            .replace("{s}", (cfg.subdomains ?? [])[0] ?? "")
            .replace("{z}", String(Math.min(z, maxLvl)))
            .replace("{x}", "0")
            .replace("{y}", "0");
          console.group("[Atlas] Tile Sample");
          console.log("camera height:", h.toFixed(0), "m");
          console.log("est. tile zoom:", z, "| basemap maxLevel:", maxLvl);
          console.log("UPSCALE:", overZoomed ? "YES — blurry!" : "no");
          console.log("retina:", RETINA);
          fetch(tileUrl).then(async r => {
            const blob = await r.blob();
            console.log("content-type:", r.headers.get("content-type"));
            console.log("size:", (blob.size / 1024).toFixed(1), "KB");
            const bmp = await createImageBitmap(blob);
            console.log("bitmap:", bmp.width, "x", bmp.height);
            bmp.close();
          }).catch(e => console.error("fetch failed:", e));
          console.groupEnd();
        },
      };
    }

    return () => {
      clearInterval(dprPollId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      if (!handler.isDestroyed()) handler.destroy();
      if (managerRef.current) { managerRef.current.dispose(); }
      if (!viewer.isDestroyed()) viewer.destroy();
      viewerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync layer states whenever layers, basemap, or camera changes ────────
  useEffect(() => {
    const viewer = viewerRef.current;
    const mgr    = managerRef.current;
    if (!viewer || viewer.isDestroyed() || !mgr) return;

    const ctx: LayerContext = {
      viewer,
      cameraLevel:  cameraState.level,
      viewRect:     cameraState.viewRect,
      heightMeters: cameraState.height,
      basemap,
      powerScenario,
    };

    // Build layer states for the managed layers
    const managed: Record<string, boolean> = {
      countryBorders: layers.countryBorders,
      stateBorders:   layers.stateBorders,
      cities:         layers.cities,
      routes:         layers.routes,
      buildings:      !!is3DActive,
      powerHeatmap:   layers.powerHeatmap,
    };

    mgr.sync(managed, ctx);

  }, [
    layers.countryBorders, layers.stateBorders, layers.cities,
    layers.routes, layers.powerHeatmap,
    basemap, cameraState.level, cameraState.height, cameraState.viewRect, powerScenario,
    is3DActive,
  ]);

  // ── Adaptive SSE ─────────────────────────────────────────────────────────
  // SSE (screen-space error) controls which tile zoom level Cesium loads.
  // Lower SSE = finer tiles = sharper imagery, but more network/GPU load.
  // Cesium already factors in resolutionScale when computing error, so on
  // a 2x retina display it naturally requests finer tiles. But the default
  // SSE of 2 is still too high for crisp city-level rendering.
  // We use aggressive values at LOCAL/CITY to force the sharpest available tiles.
  useEffect(() => {
    const v = viewerRef.current;
    if (!v || v.isDestroyed()) return;
    const sse: Record<string, number> = { WORLD: 8, REGION: 2.5, LOCAL: 2, CITY: 2 };
    v.scene.globe.maximumScreenSpaceError = sse[cameraState.level] ?? 2;
    v.scene.requestRender();
  }, [cameraState.level]);

  // ── Basemap swap ──────────────────────────────────────────────────────────
  useEffect(() => {
    const v = viewerRef.current;
    if (!v || v.isDestroyed()) return;

    const ctrl = v.scene.screenSpaceCameraController;
    const canvas = v.scene.canvas;
    const cw = canvas?.clientWidth ?? 1280;
    ctrl.minimumZoomDistance = getMinimumZoomDistance(basemap, cw * (v.resolutionScale ?? 1));

    // Temporarily enable continuous rendering so new tiles load immediately
    // (requestRenderMode blocks tile fetching if no scene changes detected).
    v.scene.requestRenderMode = false;
    const reEnableTimer = setTimeout(() => {
      if (!v.isDestroyed()) v.scene.requestRenderMode = true;
    }, 3000);

    const applyProvider = (provider: Cesium.ImageryProvider) => {
      if (v.isDestroyed()) return;
      v.imageryLayers.removeAll();
      v.imageryLayers.addImageryProvider(provider);
      v.scene.requestRender();
    };

    if (isVectorBasemap(basemap)) {
      createVectorProvider(basemap as VectorStyleId).then(vp => {
        applyProvider(vp as any);
      }).catch((err) => {
        console.warn("[Atlas] Vector basemap failed:", err, "— falling back to raster");
        applyProvider(makeRasterProvider("osmDark"));
      });
    } else {
      applyProvider(makeRasterProvider(basemap));
    }

    return () => clearTimeout(reEnableTimer);
  }, [basemap]);

  // ── 3D mode transitions ──────────────────────────────────────────────────
  // The actual 3D enter/exit logic lives in the imperative ref methods
  // (enter3DMode / exit3DMode) which handle flyTo, scene settings, and
  // buildings layer sync atomically. This effect is intentionally empty.

  // ── DC visibility + selection + basemap colours ───────────────────────────
  useEffect(() => {
    const src = dcSourceRef.current;
    if (!src) return;
    src.show = layers.points;
    const light = isLight(basemap);
    src.entities.values.forEach(e => {
      const dc = (e as any).dcData as DataCenter|undefined;
      if (!dc||!e.point) return;
      const sel = dc.id===selectedId;
      const hi  = !highlightIds || highlightIds.includes(dc.id);
      e.point.pixelSize     = new Cesium.ConstantProperty(tierSize(dc.tier)+(sel?7:0));
      e.point.color         = new Cesium.ConstantProperty(sel ? Cesium.Color.fromCssColorString("#8587e3") : !hi ? tierColor(dc.tier,light).withAlpha(0.25) : tierColor(dc.tier,light));
      e.point.outlineColor  = new Cesium.ConstantProperty(sel ? Cesium.Color.WHITE : light ? Cesium.Color.fromCssColorString("#1a1b2e").withAlpha(0.7) : Cesium.Color.BLACK.withAlpha(0.45));
      e.point.outlineWidth  = new Cesium.ConstantProperty(sel?3:light?2:1);
    });
    src.clustering.enabled = cameraState.level === "WORLD" || cameraState.level === "REGION";
    viewerRef.current?.scene.requestRender();
  }, [layers.points, selectedId, highlightIds, basemap, cameraState.level]);

  // ── Power generation layer ────────────────────────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer||viewer.isDestroyed()) return;
    let src = powerGenRef.current;
    if (!src) { src = new Cesium.CustomDataSource("power-gen"); powerGenRef.current = src; viewer.dataSources.add(src); }
    src.entities.removeAll();
    src.show = layers.powerGeneration;
    if (!layers.powerGeneration||cameraState.level==="WORLD") { viewer.scene.requestRender(); return; }
    const reqId = ++powerGenReqId.current;
    import("@/lib/power/staticReferenceData").then(({ STATIC_LARGE_PLANTS }) => {
      if (reqId !== powerGenReqId.current) return;
      if (!src) return;
      const rect = cameraState.viewRect;
      const visible = rect ? STATIC_LARGE_PLANTS.filter(p=>p.lat>=rect.south-2&&p.lat<=rect.north+2&&p.lng>=rect.west-2&&p.lng<=rect.east+2) : STATIC_LARGE_PLANTS;
      const FUEL: Record<string,string> = { NUC:"#60a5fa",WAT:"#34d399",NG:"#f97316",SUN:"#fbbf24",WND:"#a78bfa",COL:"#6b7280",SUB:"#6b7280",BAT:"#ec4899",GEO:"#84cc16" };
      for (const p of visible) {
        const color = Cesium.Color.fromCssColorString(FUEL[p.fuelType]??"#94a3b8");
        src!.entities.add({ position: Cesium.Cartesian3.fromDegrees(p.lng,p.lat,2000), point: new Cesium.PointGraphics({ pixelSize:Math.min(16,Math.max(6,Math.sqrt(p.capacityMw/100)*4)), color:color.withAlpha(0.85), outlineColor:Cesium.Color.BLACK.withAlpha(0.5), outlineWidth:1.5, disableDepthTestDistance:Number.POSITIVE_INFINITY, scaleByDistance:new Cesium.NearFarScalar(100_000,1.4,5_000_000,0.5) }) });
      }
      viewer.scene.requestRender();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers.powerGeneration, cameraState.level, cameraState.viewRect]);

  // ── Power queue layer ─────────────────────────────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer||viewer.isDestroyed()) return;
    let src = powerQueueRef.current;
    if (!src) { src = new Cesium.CustomDataSource("power-queue"); powerQueueRef.current = src; viewer.dataSources.add(src); }
    src.entities.removeAll();
    src.show = layers.powerQueue;
    if (!layers.powerQueue||cameraState.level==="WORLD") { viewer.scene.requestRender(); return; }
    const rect = cameraState.viewRect; if (!rect) return;
    const buf=3;
    const myQueueId = ++powerQueueReqId.current;
    fetch(`/api/power/queue?west=${(rect.west-buf).toFixed(2)}&south=${(rect.south-buf).toFixed(2)}&east=${(rect.east+buf).toFixed(2)}&north=${(rect.north+buf).toFixed(2)}`)
      .then(r=>r.json()).then((data:{aggregates?:Array<{lat:number;lng:number;queuedMw:number}>}) => {
        if (!src || myQueueId !== powerQueueReqId.current) return;
        for (const a of data.aggregates??[]) {
          if (!a.queuedMw) continue;
          const sz = Math.min(18,Math.max(8,Math.sqrt(a.queuedMw/5000)*14));
          src!.entities.add({ position:Cesium.Cartesian3.fromDegrees(a.lng,a.lat,3000), point:new Cesium.PointGraphics({ pixelSize:sz, color:Cesium.Color.fromCssColorString("#fbbf24").withAlpha(0.65), outlineColor:Cesium.Color.fromCssColorString("#92400e").withAlpha(0.5), outlineWidth:1.5, disableDepthTestDistance:Number.POSITIVE_INFINITY }) });
        }
        viewer.scene.requestRender();
      }).catch(()=>{});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers.powerQueue, cameraState.level, cameraState.viewRect]);

  // ── Linode regions ────────────────────────────────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer||viewer.isDestroyed()) return;
    let src = linodeSourceRef.current;
    if (!src) { src = new Cesium.CustomDataSource("linode"); linodeSourceRef.current = src; viewer.dataSources.add(src); }
    src.entities.removeAll();
    src.show = layers.linodeRegions;
    if (!layers.linodeRegions) { viewer.scene.requestRender(); return; }
    const rid = ++linodeReqId.current;
    fetch("/api/providers/linode/regions").then(r=>r.json()).then((data:{regions?:ProviderRegion[]})=>{
      if (rid!==linodeReqId.current||!src||viewer.isDestroyed()) return;
      for (const r of (data.regions??[]).filter(x=>x.lat!=null&&x.lng!=null)) {
        const sel = r.region_id===selectedLinodeId;
        const e = src!.entities.add({ position:Cesium.Cartesian3.fromDegrees(r.lng!,r.lat!,1000), point:new Cesium.PointGraphics({ pixelSize:sel?16:10, color:sel?Cesium.Color.fromCssColorString("#34d399"):Cesium.Color.fromCssColorString("#34d399").withAlpha(0.75), outlineColor:sel?Cesium.Color.WHITE:Cesium.Color.fromCssColorString("#065f46").withAlpha(0.6), outlineWidth:sel?3:2, disableDepthTestDistance:Number.POSITIVE_INFINITY, scaleByDistance:new Cesium.NearFarScalar(200_000,1.4,8_000_000,0.7) }) });
        (e as any).linodeData = r;
      }
      viewer.scene.requestRender();
    }).catch(()=>{});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers.linodeRegions, selectedLinodeId]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const isWorldView = cameraState.level === "WORLD";
  return (
    <div className="absolute inset-0 w-full h-full bg-[#020202] overflow-hidden overscroll-none">
      <style>{`
        .cesium-viewer,.cesium-widget{position:relative;overflow:hidden;width:100%;height:100%;}
        .cesium-widget canvas{width:100%;height:100%;touch-action:none;overscroll-behavior:none;image-rendering:auto;}
        .cesium-viewer-cesiumWidgetContainer{width:100%;height:100%;}
        .cesium-credit-container,.cesium-widget-credits{display:none!important;}
        @keyframes atlas-fadein{from{opacity:0}to{opacity:1}}
        .atlas-world-bg{animation:atlas-fadein 0.8s ease-out forwards;}
      `}</style>

      {/* "ATOM AI" background text when fully zoomed out */}
      {isWorldView && (
        <div className="atlas-world-bg absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0" aria-hidden="true">
          <span className="font-bold uppercase text-center leading-none" style={{ fontSize:"clamp(4rem,18vw,22rem)", color:"rgba(246,246,253,0.025)", letterSpacing:"0.15em" }}>ATOM AI</span>
          <span className="mt-4 text-center" style={{ fontSize:"clamp(0.6rem,1.4vw,1.1rem)", color:"rgba(246,246,253,0.05)", letterSpacing:"0.4em" }}>INFRASTRUCTURE ATLAS</span>
        </div>
      )}

      <div ref={containerRef} className="absolute inset-0 w-full h-full" style={{ touchAction: "none" }} />

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#020202] text-[rgba(246,246,253,0.5)] text-sm z-10">Loading map…</div>
      )}

      <RenderDebugOverlay
        cameraState={cameraState}
        viewerReady={isReady}
        viewerRef={viewerRef as React.RefObject<unknown>}
        canvasContainerRef={containerRef}
        layerManagerRef={managerRef}
        moveSourceRef={moveSourceRef}
        isSelectedRef={isSelectedRef}
      />

      {tooltip && (
        <div className="pointer-events-none absolute z-20 bg-[rgba(6,7,15,0.92)] backdrop-blur-sm border border-[rgba(246,246,253,0.1)] rounded-xl px-3 py-2 shadow-lg max-w-[220px]" style={{ left:tooltip.x+14, top:tooltip.y-10 }}>
          <p className="text-sm font-semibold text-[#f6f6fd] leading-snug">{tooltip.dc.name}</p>
          <p className="text-xs text-[rgba(246,246,253,0.55)] mt-0.5">{[tooltip.dc.city,tooltip.dc.stateOrRegion,tooltip.dc.country].filter(Boolean).join(", ")}</p>
          {tooltip.dc.capabilities.length > 0 && <p className="text-[11px] text-[rgba(162,163,233,0.8)] mt-1">{tooltip.dc.capabilities.slice(0,3).join(", ")}</p>}
        </div>
      )}

      {/* Attribution */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-3 py-1 rounded-full bg-[rgba(2,2,2,0.55)] backdrop-blur-sm">
        <span className="text-[10px] text-[rgba(246,246,253,0.45)]">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">OpenStreetMap</a>
          {" "}· <a href="https://carto.com/attributions" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)]">Carto</a>
          {" "}· <a href="https://www.peeringdb.com" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)]">PeeringDB</a>
          {" "}· <a href="https://www.wikidata.org" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)]">Wikidata CC0</a>
          {" "}· <a href="https://www.telegeography.com" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)]">TeleGeography</a>
          {" "}· <a href="https://openei.org/wiki/Utility_Rate_Database" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)]">OpenEI URDB</a>
          {" "}· <a href="https://www.eia.gov/electricity/data/eia860/" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)]">EIA-860</a>
          {" "}· <a href="https://www.epa.gov/egrid" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)]">EPA eGRID</a>
          {" "}· <a href="https://www.linode.com/docs/api/regions/" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)]">Akamai/Linode</a>
        </span>
      </div>
    </div>
  );
});

AtlasMap.displayName = "AtlasMap";
export default AtlasMap;

// ─── helpers ──────────────────────────────────────────────────────────────

function makeClusterCanvas(count: number): HTMLCanvasElement {
  const size = count>99?52:count>9?46:38;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const r = size/2;
  ctx.beginPath(); ctx.arc(r,r,r-1,0,Math.PI*2); ctx.fillStyle="rgba(105,106,172,0.25)"; ctx.fill();
  ctx.beginPath(); ctx.arc(r,r,r*0.72,0,Math.PI*2); ctx.fillStyle="rgba(105,106,172,0.9)"; ctx.fill();
  ctx.fillStyle="#f6f6fd"; ctx.font=`bold ${count>99?12:13}px system-ui, sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(String(count),r,r);
  return canvas;
}
