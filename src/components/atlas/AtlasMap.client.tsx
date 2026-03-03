/**
 * AtlasMap — CesiumJS-based interactive infrastructure map.
 *
 * Layer toggle correctness rules enforced here:
 *  1. Every async data load applies the CURRENT layer state when it resolves
 *     (fixes the race: "toggle off during fetch → layer still appears").
 *  2. Every .show change is followed by viewer.scene.requestRender() to
 *     guarantee the viewport updates even if Cesium batches frames.
 *  3. Each async effect carries a requestId (integer); on re-run the old id
 *     is incremented and stale callbacks silently discard their results.
 *  4. The viewer is created once and destroyed on unmount; a guard prevents
 *     double-init (React strict mode / hot reload).
 */
"use client";

if (typeof window !== "undefined") {
  (window as any).CESIUM_BASE_URL = "/cesium";
}

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as Cesium from "cesium";

import { DATA_CENTERS, type DataCenter } from "@/data/dataCenters";
import { useCameraLevel } from "./useCameraLevel";
import { initCityIndex, getCitiesForLevel } from "./cities/cityIndex";
import DebugOverlay from "./DebugOverlay";

// ─── types ────────────────────────────────────────────────────────────────────

Cesium.Ion.defaultAccessToken = "";

export type Basemap = "osmDark" | "osmLight" | "osmStandard";

export type AtlasLayers = {
  countryBorders: boolean;
  stateBorders: boolean;
  cities: boolean;
  points: boolean;
  routes: boolean;
  powerHeatmap: boolean;
  powerGeneration: boolean;
  powerCarbon: boolean;
  powerQueue: boolean;
  linodeRegions: boolean;
};

export type AtlasMapRef = {
  flyTo: (pos: { lat: number; lng: number; height?: number }, durationSeconds?: number) => void;
  resetView: () => void;
};

export type PowerScenario = { targetMw: number; radiusKm: number };

import type { ProviderRegion } from "@/lib/providers/linode/types";

type AtlasMapProps = {
  selectedId?: string | null;
  onSelectDc?: (dc: DataCenter | null) => void;
  highlightIds?: string[] | null;
  layers: AtlasLayers;
  basemap: Basemap;
  powerScenario?: PowerScenario;
  onMapClick?: (lat: number, lng: number) => void;
  onSelectLinode?: (region: ProviderRegion | null) => void;
  selectedLinodeId?: string | null;
};

type TooltipState = { x: number; y: number; dc: DataCenter } | null;

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeProvider(basemap: Basemap): Cesium.ImageryProvider {
  const commonOpts = { minimumLevel: 0, tileWidth: 256, tileHeight: 256 } as const;
  switch (basemap) {
    case "osmLight":
      return new Cesium.UrlTemplateImageryProvider({
        ...commonOpts,
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        credit: new Cesium.Credit("Carto, OpenStreetMap contributors"),
        maximumLevel: 20,
      });
    case "osmStandard":
      return new Cesium.UrlTemplateImageryProvider({
        ...commonOpts,
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        credit: new Cesium.Credit("OpenStreetMap contributors"),
        maximumLevel: 19,
      });
    case "osmDark":
    default:
      return new Cesium.UrlTemplateImageryProvider({
        ...commonOpts,
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        credit: new Cesium.Credit("Carto, OpenStreetMap contributors"),
        maximumLevel: 20,
      });
  }
}

function isLightBasemap(b: Basemap) {
  return b === "osmLight" || b === "osmStandard";
}

function tierPixelSize(tier: DataCenter["tier"]): number {
  switch (tier) {
    case "hyperscale": return 13;
    case "core":       return 10;
    case "enterprise": return 9;
    case "edge":       return 8;
    default:           return 9;
  }
}

function tierColor(tier: DataCenter["tier"], light = false): Cesium.Color {
  if (light) {
    switch (tier) {
      case "hyperscale": return Cesium.Color.fromCssColorString("#3e3f7e").withAlpha(0.95);
      case "core":       return Cesium.Color.fromCssColorString("#4c4dac").withAlpha(0.93);
      case "enterprise": return Cesium.Color.fromCssColorString("#5a5bb8").withAlpha(0.9);
      case "edge":       return Cesium.Color.fromCssColorString("#696aac").withAlpha(0.92);
      default:           return Cesium.Color.fromCssColorString("#4c4dac").withAlpha(0.88);
    }
  }
  switch (tier) {
    case "hyperscale": return Cesium.Color.fromCssColorString("#8587e3").withAlpha(0.97);
    case "core":       return Cesium.Color.fromCssColorString("#a2a3e9").withAlpha(0.93);
    case "enterprise": return Cesium.Color.fromCssColorString("#c7c8f2").withAlpha(0.88);
    case "edge":       return Cesium.Color.fromCssColorString("#696aac").withAlpha(0.9);
    default:           return Cesium.Color.fromCssColorString("#a2a3e9").withAlpha(0.85);
  }
}

function requestRender(viewer: Cesium.Viewer | null) {
  if (viewer && !viewer.isDestroyed()) viewer.scene.requestRender();
}

// ─── component ────────────────────────────────────────────────────────────────

const AtlasMap = forwardRef<AtlasMapRef, AtlasMapProps>(
  ({ selectedId, onSelectDc, highlightIds, layers, basemap, powerScenario, onMapClick, onSelectLinode, selectedLinodeId }, ref) => {
    const containerRef  = useRef<HTMLDivElement | null>(null);
    const viewerRef     = useRef<Cesium.Viewer | null>(null);

    // ── Data source refs (one per layer) ──────────────────────────────────
    const countrySourceRef   = useRef<Cesium.GeoJsonDataSource | null>(null);
    const stateSourceRef     = useRef<Cesium.GeoJsonDataSource | null>(null);
    const dcSourceRef        = useRef<Cesium.CustomDataSource | null>(null);
    const citySourceRef      = useRef<Cesium.CustomDataSource | null>(null);
    const routePrimRef       = useRef<Cesium.PrimitiveCollection | null>(null);
    const powerHeatmapRef    = useRef<Cesium.PrimitiveCollection | null>(null);
    const powerGenSourceRef  = useRef<Cesium.CustomDataSource | null>(null);
    const powerQueueSourceRef= useRef<Cesium.CustomDataSource | null>(null);
    const linodeSourceRef    = useRef<Cesium.CustomDataSource | null>(null);

    // ── Request IDs — incremented to discard stale async callbacks ────────
    // Each async effect has its own counter. When the effect re-runs, it
    // increments the counter; the old callback compares its captured id
    // to the ref's current value and silently returns if they differ.
    const heatmapReqId    = useRef(0);
    const genReqId        = useRef(0);
    const queueReqId      = useRef(0);
    const linodeReqId     = useRef(0);
    const heatmapAbort    = useRef<AbortController | null>(null);

    // ── Layers ref — so async callbacks can read the CURRENT toggle state
    // without being stale closures
    const layersRef = useRef<AtlasLayers>(layers);
    useEffect(() => { layersRef.current = layers; });

    const [tooltip, setTooltip] = useState<TooltipState>(null);
    const [isReady, setIsReady] = useState(false);
    const cameraState = useCameraLevel(viewerRef);

    // ── expose flyTo + resetView ───────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      flyTo: (pos, durationSeconds = 1.5) => {
        const viewer = viewerRef.current;
        if (!viewer || viewer.isDestroyed()) return;
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat, pos.height ?? 1_500_000),
          duration: durationSeconds,
          easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
        });
      },
      resetView: () => {
        const viewer = viewerRef.current;
        if (!viewer || viewer.isDestroyed()) return;
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(-20, 25, 18_000_000),
          duration: 2,
          easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
        });
      },
    }), []);

    // ── Initialise Cesium viewer ONCE ─────────────────────────────────────
    useEffect(() => {
      const container = containerRef.current;
      if (!container || viewerRef.current) return; // guard double-init

      const viewer = new Cesium.Viewer(container, {
        animation: false, baseLayerPicker: false, fullscreenButton: false,
        geocoder: false, homeButton: false, infoBox: false,
        navigationHelpButton: false, navigationInstructionsInitiallyVisible: false,
        sceneModePicker: false, selectionIndicator: false, timeline: false, vrButton: false,
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      });

      (viewer.cesiumWidget as any)._creditContainer.style.display = "none";
      viewer.scene.globe.baseColor       = Cesium.Color.fromCssColorString("#1a1b2e");
      viewer.scene.globe.enableLighting  = false;
      viewer.scene.globe.depthTestAgainstTerrain = false;
      viewer.scene.globe.maximumScreenSpaceError = 2;
      viewer.scene.globe.preloadAncestors = true;
      viewer.scene.globe.tileCacheSize    = 1000;
      viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 2);
      viewer.scene.postProcessStages.fxaa.enabled = true;
      viewer.scene.fog.enabled = false;

      const ctrl = viewer.scene.screenSpaceCameraController;
      ctrl.minimumZoomDistance = 150;
      ctrl.maximumZoomDistance = 2.5e7;

      if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = false;
      if (viewer.scene.skyBox) (viewer.scene.skyBox as any).show = false;
      if (viewer.scene.sun)  viewer.scene.sun.show  = false;
      if (viewer.scene.moon) viewer.scene.moon.show = false;
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#020202");

      // Prevent canvas wheel events from scrolling the page
      const canvas = viewer.scene.canvas;
      const stopWheel = (e: WheelEvent) => e.stopPropagation();
      canvas.addEventListener("wheel", stopWheel, { passive: true });
      canvas.addEventListener("contextmenu", (e) => e.preventDefault());

      // Sharpness + resize
      const onDebugKey = (e: KeyboardEvent) => {
        if (e.shiftKey && e.key === "S") {
          const v = viewerRef.current;
          if (!v || v.isDestroyed()) return;
          console.group("[Atlas] Sharpness debug");
          console.log("devicePixelRatio:", window.devicePixelRatio);
          console.log("viewer.resolutionScale:", v.resolutionScale);
          console.log("globe.maximumScreenSpaceError:", v.scene.globe.maximumScreenSpaceError);
          console.log("FXAA:", v.scene.postProcessStages.fxaa.enabled);
          console.log("fog:", v.scene.fog.enabled);
          console.groupEnd();
        }
      };
      const onResize = () => {
        if (!viewer.isDestroyed()) {
          viewer.resize();
          viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 2);
        }
      };
      window.addEventListener("keydown", onDebugKey);
      window.addEventListener("resize", onResize);

      // Initial basemap
      viewer.imageryLayers.addImageryProvider(makeProvider("osmDark"));
      viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(-20, 25, 18_000_000) });

      viewerRef.current = viewer;

      // Interaction handler
      const handler = new Cesium.ScreenSpaceEventHandler(canvas);
      handler.setInputAction((ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const picked = viewer.scene.pick(ev.position);
        if (picked?.id?.dcData) {
          onSelectDc?.(picked.id.dcData as DataCenter);
          onSelectLinode?.(null);
        } else if (picked?.id?.linodeData) {
          onSelectLinode?.(picked.id.linodeData as ProviderRegion);
          onSelectDc?.(null);
          setTooltip(null);
        } else {
          onSelectDc?.(null);
          onSelectLinode?.(null);
          setTooltip(null);
          if (onMapClick) {
            const cart = viewer.camera.pickEllipsoid(ev.position, viewer.scene.globe.ellipsoid);
            if (cart) {
              const carto = Cesium.Cartographic.fromCartesian(cart);
              onMapClick(
                Cesium.Math.toDegrees(carto.latitude),
                Cesium.Math.toDegrees(carto.longitude),
              );
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction((ev: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        const picked = viewer.scene.pick(ev.endPosition);
        if (picked?.id?.dcData) {
          setTooltip({ x: ev.endPosition.x, y: ev.endPosition.y, dc: picked.id.dcData as DataCenter });
        } else if (picked?.id?.linodeData) {
          const r = picked.id.linodeData as ProviderRegion;
          setTooltip({ x: ev.endPosition.x, y: ev.endPosition.y, dc: { name: r.label, city: r.city ?? "", stateOrRegion: r.metro ?? undefined, country: r.country ?? "", capabilities: r.capabilities } as DataCenter });
        } else {
          setTooltip(null);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // Load all static layers asynchronously
      initCityIndex();
      loadCountryBorders(viewer);
      loadStateBorders(viewer);
      setupDCMarkers(viewer);
      loadRoutes(viewer);

      setIsReady(true);

      return () => {
        window.removeEventListener("keydown", onDebugKey);
        window.removeEventListener("resize", onResize);
        if (!handler.isDestroyed()) handler.destroy();
        routePrimRef.current    = null;
        powerHeatmapRef.current = null;
        if (!viewer.isDestroyed()) viewer.destroy();
        viewerRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Async static layer loaders ────────────────────────────────────────
    //
    // Each loader: loads data, sets its ref, THEN reads layersRef.current
    // to apply the toggle state that is current at the moment of resolution.
    // This eliminates the race between async load and early toggle changes.

    async function loadCountryBorders(viewer: Cesium.Viewer) {
      try {
        const source = await Cesium.GeoJsonDataSource.load("/geo/countries.geojson", {
          stroke: Cesium.Color.fromCssColorString("#f6f6fd").withAlpha(0.14),
          fill: Cesium.Color.TRANSPARENT,
          strokeWidth: 1,
          clampToGround: true,
        });
        if (viewer.isDestroyed()) return;
        countrySourceRef.current = source;
        source.name = "country-borders";
        // ✅ Apply current toggle state AFTER async load completes
        source.show = layersRef.current.countryBorders;
        viewer.dataSources.add(source);
        requestRender(viewer);
        console.log(`[Layers] render countryBorders show=${source.show} entities=${source.entities.values.length}`);
      } catch (e) {
        console.warn("[AtlasMap] Country borders load failed:", e);
      }
    }

    async function loadStateBorders(viewer: Cesium.Viewer) {
      try {
        const source = await Cesium.GeoJsonDataSource.load("/geo/states_provinces.geojson", {
          stroke: Cesium.Color.fromCssColorString("#f6f6fd").withAlpha(0.07),
          fill: Cesium.Color.TRANSPARENT,
          strokeWidth: 0.6,
          clampToGround: true,
        });
        if (viewer.isDestroyed()) return;
        stateSourceRef.current = source;
        source.name = "state-borders";
        // ✅ Apply current toggle state AFTER async load completes
        source.show = layersRef.current.stateBorders;
        viewer.dataSources.add(source);
        requestRender(viewer);
        console.log(`[Layers] render stateBorders show=${source.show}`);
      } catch (e) {
        console.warn("[AtlasMap] State borders load failed:", e);
      }
    }

    function setupDCMarkers(viewer: Cesium.Viewer) {
      const source = new Cesium.CustomDataSource("data-centers");
      dcSourceRef.current = source;
      source.clustering.enabled = true;
      source.clustering.pixelRange = 45;
      source.clustering.minimumClusterSize = 3;
      source.clustering.clusterEvent.addEventListener((clustered: Cesium.Entity[], cluster: any) => {
        cluster.label.show = false;
        cluster.billboard.show = true;
        cluster.billboard.image = makeClusterCanvas(clustered.length);
        cluster.billboard.scale = 1;
        cluster.billboard.verticalOrigin   = Cesium.VerticalOrigin.CENTER;
        cluster.billboard.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
        cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
      });
      DATA_CENTERS.forEach((dc) => {
        const entity = source.entities.add({
          position: Cesium.Cartesian3.fromDegrees(dc.lng, dc.lat),
          point: new Cesium.PointGraphics({
            pixelSize: tierPixelSize(dc.tier),
            color: tierColor(dc.tier),
            outlineColor: Cesium.Color.BLACK.withAlpha(0.4),
            outlineWidth: 1,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            scaleByDistance: new Cesium.NearFarScalar(200_000, 1.4, 8_000_000, 0.7),
          }),
        });
        (entity as any).dcData = dc;
      });
      source.show = layersRef.current.points; // ✅ Apply initial toggle state
      viewer.dataSources.add(source);
      console.log(`[Layers] render datacenters count=${DATA_CENTERS.length} show=${source.show}`);
    }

    async function loadRoutes(viewer: Cesium.Viewer) {
      try {
        const res = await fetch("/geo/submarine-cables.json");
        if (!res.ok || viewer.isDestroyed()) return;
        const geo = await res.json();
        const segments: { positions: Cesium.Cartesian3[]; color: string }[] = [];
        for (const feat of geo?.features ?? []) {
          const type   = feat.geometry?.type ?? "";
          const color  = feat.properties?.color ?? "#696aac";
          const arrays = type === "LineString"       ? [feat.geometry.coordinates]
                       : type === "MultiLineString"  ? feat.geometry.coordinates
                       : [];
          for (const line of arrays) {
            if (!Array.isArray(line) || line.length < 2) continue;
            const positions = line.map(([lng, lat]: [number, number]) =>
              Cesium.Cartesian3.fromDegrees(lng, lat, 5000));
            if (positions.length >= 2) segments.push({ positions, color });
          }
        }
        const coll = new Cesium.PrimitiveCollection();
        const lines = new Cesium.PolylineCollection();
        for (const { positions, color } of segments) {
          lines.add({ positions, width: 1.5, material: Cesium.Material.fromType("Color", { color: Cesium.Color.fromCssColorString(color).withAlpha(0.65) }) });
        }
        coll.add(lines);
        // ✅ Apply current toggle state AFTER load
        coll.show = layersRef.current.routes && cameraState.level !== "WORLD";
        routePrimRef.current = coll;
        viewer.scene.primitives.add(coll);
        requestRender(viewer);
        console.info(`[Layers] render routes segments=${segments.length} show=${coll.show}`);
      } catch (e) {
        console.warn("[AtlasMap] Routes load failed:", e);
      }
    }

    function makeClusterCanvas(count: number): HTMLCanvasElement {
      const size = count > 99 ? 52 : count > 9 ? 46 : 38;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const r = size / 2;
      ctx.beginPath(); ctx.arc(r, r, r - 1, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(105,106,172,0.25)"; ctx.fill();
      ctx.beginPath(); ctx.arc(r, r, r * 0.72, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(105,106,172,0.9)"; ctx.fill();
      ctx.fillStyle = "#f6f6fd";
      ctx.font = `bold ${count > 99 ? 12 : 13}px system-ui, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(count), r, r);
      return canvas;
    }

    // ── Basemap swap ──────────────────────────────────────────────────────
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(makeProvider(basemap));
      requestRender(viewer);
    }, [basemap]);

    // ── Country borders toggle ─────────────────────────────────────────────
    useEffect(() => {
      const src = countrySourceRef.current;
      if (!src) return; // source not yet loaded — loadCountryBorders applies initial state on resolve
      src.show = layers.countryBorders;
      console.log(`[Layers] toggle countryBorders -> ${layers.countryBorders}`);
      requestRender(viewerRef.current);
    }, [layers.countryBorders]);

    // ── State borders toggle ───────────────────────────────────────────────
    useEffect(() => {
      const src = stateSourceRef.current;
      if (!src) return;
      src.show = layers.stateBorders;
      console.log(`[Layers] toggle stateBorders -> ${layers.stateBorders}`);
      requestRender(viewerRef.current);
    }, [layers.stateBorders]);

    // ── Data centers toggle ────────────────────────────────────────────────
    useEffect(() => {
      const src = dcSourceRef.current;
      if (!src) return;
      src.show = layers.points;
      console.log(`[Layers] toggle datacenters -> ${layers.points}`);
      requestRender(viewerRef.current);
    }, [layers.points]);

    // ── Clustering by zoom level ───────────────────────────────────────────
    useEffect(() => {
      const src = dcSourceRef.current;
      if (!src) return;
      src.clustering.enabled = cameraState.level === "WORLD" || cameraState.level === "REGION";
    }, [cameraState.level]);

    // ── Fiber routes toggle + zoom gate ───────────────────────────────────
    useEffect(() => {
      const prim = routePrimRef.current;
      if (!prim) return;
      // Show only when toggled ON AND not at world zoom
      const show = layers.routes && cameraState.level !== "WORLD";
      prim.show = show;
      console.log(`[Layers] toggle routes -> toggle=${layers.routes} zoom=${cameraState.level} effective=${show}`);
      requestRender(viewerRef.current);
    }, [layers.routes, cameraState.level]);

    // ── DC visual (selection + basemap colours) ────────────────────────────
    useEffect(() => {
      const source = dcSourceRef.current;
      if (!source) return;
      const light = isLightBasemap(basemap);
      source.entities.values.forEach((entity) => {
        const dc = (entity as any).dcData as DataCenter | undefined;
        if (!dc || !entity.point) return;
        const pt = entity.point;
        const isSel  = dc.id === selectedId;
        const isHigh = !highlightIds || highlightIds.includes(dc.id);
        pt.pixelSize = new Cesium.ConstantProperty(tierPixelSize(dc.tier) + (isSel ? 7 : 0));
        pt.color     = new Cesium.ConstantProperty(isSel ? Cesium.Color.fromCssColorString("#8587e3") : !isHigh ? tierColor(dc.tier, light).withAlpha(0.25) : tierColor(dc.tier, light));
        pt.outlineColor = new Cesium.ConstantProperty(isSel ? Cesium.Color.WHITE : light ? Cesium.Color.fromCssColorString("#1a1b2e").withAlpha(0.7) : Cesium.Color.BLACK.withAlpha(0.45));
        pt.outlineWidth = new Cesium.ConstantProperty(isSel ? 3 : light ? 2 : 1);
      });
      requestRender(viewerRef.current);
    }, [selectedId, highlightIds, basemap]);

    // ── City labels (LOD-driven) ──────────────────────────────────────────
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;
      let source = citySourceRef.current;
      if (!source) {
        source = new Cesium.CustomDataSource("cities");
        citySourceRef.current = source;
        viewer.dataSources.add(source);
      }
      source.entities.removeAll();
      const t0 = performance.now();
      if (!layers.cities || cameraState.level === "WORLD") {
        source.show = false;
        requestRender(viewer);
        return;
      }
      source.show = true;
      const cities = getCitiesForLevel(cameraState);
      for (const city of cities) {
        source.entities.add({
          position: Cesium.Cartesian3.fromDegrees(city.lng, city.lat),
          label: new Cesium.LabelGraphics({
            text: city.name,
            font: "600 13px system-ui, -apple-system, sans-serif",
            fillColor: Cesium.Color.fromCssColorString("#e8e9ff"),
            outlineColor: Cesium.Color.fromCssColorString("#020202"),
            outlineWidth: 4,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            scaleByDistance: new Cesium.NearFarScalar(50_000, 1.3, 3_000_000, 0.65),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 4_000_000),
            scale: city.scalerank <= 1 ? 1.2 : city.scalerank <= 3 ? 1.0 : 0.85,
          }),
          point: city.scalerank <= 3
            ? new Cesium.PointGraphics({ pixelSize: 3, color: Cesium.Color.fromCssColorString("#a2a3e9").withAlpha(0.7), disableDepthTestDistance: Number.POSITIVE_INFINITY, scaleByDistance: new Cesium.NearFarScalar(50_000, 1.2, 2_000_000, 0.5) })
            : undefined,
        });
      }
      requestRender(viewer);
      console.log(`[Layers] render cities count=${cities.length} took=${(performance.now()-t0).toFixed(1)}ms level=${cameraState.level}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layers.cities, cameraState.level, cameraState.viewRect]);

    // ── Power heatmap ─────────────────────────────────────────────────────
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;

      // Clear old primitives
      if (powerHeatmapRef.current) {
        if (viewer.scene.primitives.contains(powerHeatmapRef.current)) {
          viewer.scene.primitives.remove(powerHeatmapRef.current);
        }
        powerHeatmapRef.current = null;
      }

      if (!layers.powerHeatmap || cameraState.level === "WORLD") {
        requestRender(viewer);
        return;
      }
      const rect = cameraState.viewRect;
      if (!rect) return;

      heatmapAbort.current?.abort();
      const controller = new AbortController();
      heatmapAbort.current = controller;
      const myReqId = ++heatmapReqId.current;
      const t0 = performance.now();
      const grid = cameraState.level === "CITY" ? 15 : 10;
      const mw   = powerScenario?.targetMw ?? 100;
      const url  = `/api/power/viewport?west=${rect.west.toFixed(4)}&south=${rect.south.toFixed(4)}&east=${rect.east.toFixed(4)}&north=${rect.north.toFixed(4)}&mw=${mw}&grid=${grid}`;

      fetch(url, { signal: controller.signal })
        .then(r => r.json())
        .then((data: { cells?: Array<{ west: number; south: number; east: number; north: number; score: number; color: { r: number; g: number; b: number; a: number } }> }) => {
          // ✅ Discard stale request
          if (myReqId !== heatmapReqId.current) return;
          if (controller.signal.aborted) return;
          // ✅ Check toggle still ON when fetch resolves
          if (!layersRef.current.powerHeatmap) return;
          const vwr = viewerRef.current;
          if (!vwr || vwr.isDestroyed()) return;

          const cells = data.cells ?? [];
          if (cells.length === 0) return;
          const instances = cells.map(cell => {
            const { r, g, b, a } = cell.color;
            return new Cesium.GeometryInstance({
              geometry: new Cesium.RectangleGeometry({ rectangle: Cesium.Rectangle.fromDegrees(cell.west, cell.south, cell.east, cell.north), height: 200, extrudedHeight: 0 }),
              attributes: { color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(r, g, b, Math.max(a, 0.25))) },
            });
          });
          const coll = new Cesium.PrimitiveCollection();
          coll.add(new Cesium.Primitive({ geometryInstances: instances, appearance: new Cesium.PerInstanceColorAppearance({ flat: true, translucent: true }), asynchronous: false, allowPicking: false }));
          powerHeatmapRef.current = coll;
          vwr.scene.primitives.add(coll);
          requestRender(vwr);
          console.log(`[Layers] render heatmap cells=${cells.length} took=${(performance.now()-t0).toFixed(1)}ms`);
        })
        .catch(e => { if ((e as Error).name !== "AbortError") console.warn("[AtlasMap] Heatmap fetch failed:", e); });

      return () => { controller.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layers.powerHeatmap, cameraState.level, cameraState.viewRect, powerScenario?.targetMw]);

    // ── Power generation ──────────────────────────────────────────────────
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;

      let source = powerGenSourceRef.current;
      if (!source) {
        source = new Cesium.CustomDataSource("power-generation");
        powerGenSourceRef.current = source;
        viewer.dataSources.add(source);
      }
      source.entities.removeAll();
      source.show = layers.powerGeneration;

      if (!layers.powerGeneration || cameraState.level === "WORLD") {
        requestRender(viewer);
        return;
      }

      const myReqId = ++genReqId.current;
      const t0 = performance.now();

      import("@/lib/power/staticReferenceData").then(({ STATIC_LARGE_PLANTS }) => {
        // ✅ Discard stale / cancelled request
        if (myReqId !== genReqId.current) return;
        // ✅ Check toggle still ON
        if (!layersRef.current.powerGeneration) return;
        const src = powerGenSourceRef.current;
        if (!src) return;

        const rect = cameraState.viewRect;
        const BUF = 2;
        const visible = rect
          ? STATIC_LARGE_PLANTS.filter(p =>
              p.lat >= rect.south-BUF && p.lat <= rect.north+BUF &&
              p.lng >= rect.west-BUF  && p.lng <= rect.east+BUF)
          : STATIC_LARGE_PLANTS;

        const FUEL_COLORS: Record<string, string> = { NUC:"#60a5fa", WAT:"#34d399", NG:"#f97316", SUN:"#fbbf24", WND:"#a78bfa", COL:"#6b7280", SUB:"#6b7280", BAT:"#ec4899", GEO:"#84cc16" };
        for (const plant of visible) {
          const color = Cesium.Color.fromCssColorString(FUEL_COLORS[plant.fuelType] ?? "#94a3b8");
          const entity = src.entities.add({
            position: Cesium.Cartesian3.fromDegrees(plant.lng, plant.lat, 2000),
            point: new Cesium.PointGraphics({ pixelSize: Math.min(16, Math.max(6, Math.sqrt(plant.capacityMw/100)*4)), color: color.withAlpha(0.85), outlineColor: Cesium.Color.BLACK.withAlpha(0.5), outlineWidth: 1.5, disableDepthTestDistance: Number.POSITIVE_INFINITY, scaleByDistance: new Cesium.NearFarScalar(100_000,1.4,5_000_000,0.5) }),
          });
          (entity as any).genData = plant;
          if (plant.capacityMw >= 2000) {
            entity.label = new Cesium.LabelGraphics({ text: `${plant.name}\n${Math.round(plant.capacityMw)} MW`, font: "600 11px system-ui, -apple-system, sans-serif", fillColor: color, outlineColor: Cesium.Color.BLACK, outlineWidth: 2, style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(0,-20), disableDepthTestDistance: Number.POSITIVE_INFINITY, distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0,3_000_000), scaleByDistance: new Cesium.NearFarScalar(100_000,1.0,3_000_000,0.5) });
          }
        }
        requestRender(viewerRef.current);
        console.log(`[Layers] render generation count=${visible.length} took=${(performance.now()-t0).toFixed(1)}ms`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layers.powerGeneration, cameraState.level, cameraState.viewRect]);

    // ── Power queue ────────────────────────────────────────────────────────
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;

      let source = powerQueueSourceRef.current;
      if (!source) {
        source = new Cesium.CustomDataSource("power-queue");
        powerQueueSourceRef.current = source;
        viewer.dataSources.add(source);
      }
      source.entities.removeAll();
      source.show = layers.powerQueue;

      if (!layers.powerQueue || cameraState.level === "WORLD") {
        requestRender(viewer);
        return;
      }
      const rect = cameraState.viewRect;
      if (!rect) return;

      const myReqId = ++queueReqId.current;
      const buf = 3;
      const url = `/api/power/queue?west=${(rect.west-buf).toFixed(2)}&south=${(rect.south-buf).toFixed(2)}&east=${(rect.east+buf).toFixed(2)}&north=${(rect.north+buf).toFixed(2)}`;

      fetch(url)
        .then(r => r.json())
        .then((data: { aggregates?: Array<{ state: string; queuedMw: number; lat: number; lng: number }> }) => {
          // ✅ Discard stale
          if (myReqId !== queueReqId.current) return;
          // ✅ Check still ON
          if (!layersRef.current.powerQueue) return;
          const src = powerQueueSourceRef.current;
          if (!src) return;
          for (const agg of data.aggregates ?? []) {
            if (!agg.queuedMw) continue;
            const size = Math.min(18, Math.max(8, Math.sqrt(agg.queuedMw/5000)*14));
            const entity = src.entities.add({
              position: Cesium.Cartesian3.fromDegrees(agg.lng, agg.lat, 3000),
              point: new Cesium.PointGraphics({ pixelSize: size, color: Cesium.Color.fromCssColorString("#fbbf24").withAlpha(0.65), outlineColor: Cesium.Color.fromCssColorString("#92400e").withAlpha(0.5), outlineWidth: 1.5, disableDepthTestDistance: Number.POSITIVE_INFINITY, scaleByDistance: new Cesium.NearFarScalar(200_000,1.4,6_000_000,0.5) }),
            });
            (entity as any).queueData = agg;
          }
          requestRender(viewerRef.current);
        })
        .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layers.powerQueue, cameraState.level, cameraState.viewRect]);

    // ── Linode regions ────────────────────────────────────────────────────
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;

      let source = linodeSourceRef.current;
      if (!source) {
        source = new Cesium.CustomDataSource("linode-regions");
        linodeSourceRef.current = source;
        viewer.dataSources.add(source);
      }
      source.entities.removeAll();
      source.show = layers.linodeRegions;

      if (!layers.linodeRegions) {
        requestRender(viewer);
        return;
      }

      const myReqId = ++linodeReqId.current;

      fetch("/api/providers/linode/regions")
        .then(r => r.json())
        .then((data: { regions?: ProviderRegion[] }) => {
          // ✅ Discard stale
          if (myReqId !== linodeReqId.current) return;
          // ✅ Check still ON
          if (!layersRef.current.linodeRegions) return;
          const src = linodeSourceRef.current;
          if (!src || viewer.isDestroyed()) return;
          const regions = (data.regions ?? []).filter(r => r.lat !== null && r.lng !== null);
          for (const region of regions) {
            const isSel = region.region_id === selectedLinodeId;
            const entity = src.entities.add({
              position: Cesium.Cartesian3.fromDegrees(region.lng!, region.lat!, 1000),
              point: new Cesium.PointGraphics({ pixelSize: isSel ? 16 : 10, color: isSel ? Cesium.Color.fromCssColorString("#34d399") : Cesium.Color.fromCssColorString("#34d399").withAlpha(0.75), outlineColor: isSel ? Cesium.Color.WHITE : Cesium.Color.fromCssColorString("#065f46").withAlpha(0.6), outlineWidth: isSel ? 3 : 2, disableDepthTestDistance: Number.POSITIVE_INFINITY, scaleByDistance: new Cesium.NearFarScalar(200_000,1.4,8_000_000,0.7) }),
            });
            (entity as any).linodeData = region;
          }
          requestRender(viewerRef.current);
          console.log(`[Layers] render linodeRegions count=${regions.length}`);
        })
        .catch(e => console.warn("[AtlasMap] Linode fetch failed:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layers.linodeRegions, selectedLinodeId]);

    // ── Debug overlay data collector ──────────────────────────────────────
    const getLayerCounts = useCallback(() => {
      const viewer = viewerRef.current;
      const prim = routePrimRef.current;
      const primLines = prim ? (prim as any)._primitives?.[0] : null;
      return {
        countryEntities: countrySourceRef.current?.entities.values.length ?? 0,
        stateEntities:   stateSourceRef.current?.entities.values.length   ?? 0,
        cityLabels:      citySourceRef.current?.entities.values.length    ?? 0,
        dcEntities:      dcSourceRef.current?.entities.values.length      ?? 0,
        dcClusters:      0, // cluster count is runtime-only
        fiberSegments:   primLines?._polylines?.length ?? 0,
        heatmapCells:    powerHeatmapRef.current ? 1 : 0,
        genPoints:       powerGenSourceRef.current?.entities.values.length  ?? 0,
        queuePoints:     powerQueueSourceRef.current?.entities.values.length ?? 0,
        linodePoints:    linodeSourceRef.current?.entities.values.length    ?? 0,
      };
    }, []);

    // ── Render ────────────────────────────────────────────────────────────
    return (
      <div className="absolute inset-0 w-full h-full bg-[#020202] overflow-hidden overscroll-none">
        <style>{`
          .cesium-viewer,.cesium-widget{position:relative;overflow:hidden;width:100%;height:100%;}
          .cesium-widget canvas{width:100%;height:100%;touch-action:none;overscroll-behavior:none;}
          .cesium-viewer-cesiumWidgetContainer{width:100%;height:100%;}
          .cesium-credit-container,.cesium-widget-credits{display:none!important;}
        `}</style>
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#020202] text-[rgba(246,246,253,0.5)] text-sm z-10">
            Loading map…
          </div>
        )}

        {/* Dev-only debug overlay */}
        <DebugOverlay cameraState={cameraState} getLayerCounts={getLayerCounts} />

        {tooltip && (
          <div
            className="pointer-events-none absolute z-20 bg-[rgba(6,7,15,0.92)] backdrop-blur-sm border border-[rgba(246,246,253,0.1)] rounded-xl px-3 py-2 shadow-lg max-w-[220px]"
            style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
          >
            <p className="text-sm font-semibold text-[#f6f6fd] leading-snug">{tooltip.dc.name}</p>
            <p className="text-xs text-[rgba(246,246,253,0.55)] mt-0.5">
              {[tooltip.dc.city, tooltip.dc.stateOrRegion, tooltip.dc.country].filter(Boolean).join(", ")}
            </p>
            {tooltip.dc.capabilities.length > 0 && (
              <p className="text-[11px] text-[rgba(162,163,233,0.8)] mt-1">
                {tooltip.dc.capabilities.slice(0, 3).join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Attribution */}
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-3 py-1 rounded-full bg-[rgba(2,2,2,0.55)] backdrop-blur-sm">
          <span className="text-[10px] text-[rgba(246,246,253,0.45)]">
            © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">OpenStreetMap</a>
            {" "}· <a href="https://carto.com/attributions" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">Carto</a>
            {" "}· <a href="https://www.peeringdb.com" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">PeeringDB</a>
            {" "}· <a href="https://www.wikidata.org" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">Wikidata CC0</a>
            {" "}· <a href="https://www.telegeography.com" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">TeleGeography</a>
            {" "}· <a href="https://openei.org/wiki/Utility_Rate_Database" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">OpenEI URDB</a>
            {" "}· <a href="https://www.eia.gov/electricity/data/eia860/" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">EIA-860</a>
            {" "}· <a href="https://www.epa.gov/egrid" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">EPA eGRID</a>
            {" "}· <a href="https://www.linode.com/docs/api/regions/" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">Akamai/Linode API</a>
          </span>
        </div>
      </div>
    );
  }
);

AtlasMap.displayName = "AtlasMap";
export default AtlasMap;
