/**
 * AtlasMap — CesiumJS-based interactive infrastructure map.
 *
 * Replaces react-globe.gl.  Renders:
 *  - OSM / Carto raster basemap
 *  - Country + state/province borders (GeoJSON)
 *  - Data center point markers with EntityCluster
 *  - City labels with LOD zoom gating
 *  - Fiber route polylines (visible at LOCAL/CITY levels)
 *  - Hover tooltip & click-to-select
 *
 * NOTE: CesiumJS cannot run server-side. This file is always loaded via
 * `next/dynamic` with `{ ssr: false }` (see DataCenterMapLoader.tsx).
 */
"use client";

// ── Set CESIUM_BASE_URL before any Cesium code executes ─────────────────────
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

// ─── constants ────────────────────────────────────────────────────────────────

// Disable Cesium ion (we use OSM / Carto — no token needed)
Cesium.Ion.defaultAccessToken = "";

export type Basemap = "osmDark" | "osmLight" | "osmStandard";

export type AtlasLayers = {
  countryBorders: boolean;
  stateBorders: boolean;
  cities: boolean;
  points: boolean;
  routes: boolean;
  // Power & Energy
  powerHeatmap: boolean;
  powerGeneration: boolean;
  powerCarbon: boolean;
  powerQueue: boolean;
};

export type AtlasMapRef = {
  flyTo: (pos: { lat: number; lng: number; height?: number }, durationSeconds?: number) => void;
  resetView: () => void;
};

type TooltipState = { x: number; y: number; dc: DataCenter } | null;

// ─── imagery providers ────────────────────────────────────────────────────────

function makeProvider(basemap: Basemap): Cesium.ImageryProvider {
  // Standard 256-px tiles. tileWidth/tileHeight must match the tile server.
  // DO NOT set them to 512 for these providers — it causes upscaling and blur.
  const commonOpts = {
    minimumLevel: 0,
    tileWidth: 256,
    tileHeight: 256,
  } as const;

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

/** Whether the current basemap is light (affects marker colour). */
function isLightBasemap(basemap: Basemap): boolean {
  return basemap === "osmLight" || basemap === "osmStandard";
}

// ─── tier helpers ─────────────────────────────────────────────────────────────

function tierPixelSize(tier: DataCenter["tier"]): number {
  switch (tier) {
    case "hyperscale": return 13;
    case "core": return 10;
    case "enterprise": return 9;
    case "edge": return 8;
    default: return 9;
  }
}

function tierColor(tier: DataCenter["tier"], light = false): Cesium.Color {
  if (light) {
    // Darker palette for light basemaps so dots are visible
    switch (tier) {
      case "hyperscale": return Cesium.Color.fromCssColorString("#3e3f7e").withAlpha(0.95);
      case "core": return Cesium.Color.fromCssColorString("#4c4dac").withAlpha(0.93);
      case "enterprise": return Cesium.Color.fromCssColorString("#5a5bb8").withAlpha(0.9);
      case "edge": return Cesium.Color.fromCssColorString("#696aac").withAlpha(0.92);
      default: return Cesium.Color.fromCssColorString("#4c4dac").withAlpha(0.88);
    }
  }
  switch (tier) {
    case "hyperscale": return Cesium.Color.fromCssColorString("#8587e3").withAlpha(0.97);
    case "core": return Cesium.Color.fromCssColorString("#a2a3e9").withAlpha(0.93);
    case "enterprise": return Cesium.Color.fromCssColorString("#c7c8f2").withAlpha(0.88);
    case "edge": return Cesium.Color.fromCssColorString("#696aac").withAlpha(0.9);
    default: return Cesium.Color.fromCssColorString("#a2a3e9").withAlpha(0.85);
  }
}

// ─── component ────────────────────────────────────────────────────────────────

export type PowerScenario = {
  targetMw: number;
  radiusKm: number;
};

type AtlasMapProps = {
  selectedId?: string | null;
  onSelectDc?: (dc: DataCenter | null) => void;
  highlightIds?: string[] | null;
  layers: AtlasLayers;
  basemap: Basemap;
  powerScenario?: PowerScenario;
  /** Called when user clicks the map background — for Site Brief */
  onMapClick?: (lat: number, lng: number) => void;
};

const AtlasMap = forwardRef<AtlasMapRef, AtlasMapProps>(
  ({ selectedId, onSelectDc, highlightIds, layers, basemap, powerScenario, onMapClick }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewerRef = useRef<Cesium.Viewer | null>(null);
    const dcSourceRef = useRef<Cesium.CustomDataSource | null>(null);
    const citySourceRef = useRef<Cesium.CustomDataSource | null>(null);
    const routeSourceRef = useRef<Cesium.CustomDataSource | null>(null);
    const routePrimitivesRef = useRef<Cesium.PrimitiveCollection | null>(null);
    const countrySourceRef = useRef<Cesium.GeoJsonDataSource | null>(null);
    const stateSourceRef = useRef<Cesium.GeoJsonDataSource | null>(null);
    const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
    const layerListenerRef = useRef<Cesium.ImageryLayer | null>(null);
    // Power layer primitives
    const powerHeatmapRef = useRef<Cesium.PrimitiveCollection | null>(null);
    const powerGenSourceRef = useRef<Cesium.CustomDataSource | null>(null);
    const powerHeatmapFetchRef = useRef<AbortController | null>(null);

    const [tooltip, setTooltip] = useState<TooltipState>(null);
    const [isReady, setIsReady] = useState(false);

    // Camera LOD hook (reads from viewerRef)
    const cameraState = useCameraLevel(viewerRef);

    // ── expose flyTo + resetView via forwarded ref ─────────────────────────
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

    // ── initialise Cesium viewer once ──────────────────────────────────────
    useEffect(() => {
      const container = containerRef.current;
      if (!container || viewerRef.current) return;

      const viewer = new Cesium.Viewer(container, {
        // Disable all default Cesium UI chrome
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        vrButton: false,
        // Terrain: flat ellipsoid (no paid terrain needed)
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      });

      // Suppress Cesium ion credit warning
      (viewer.cesiumWidget as any)._creditContainer.style.display = "none";

      // Dark base colour shown while tiles are loading (prevents blank white flash)
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#1a1b2e");
      // Reduce performance cost — we don't need lighting for a 2D-ish map style
      viewer.scene.globe.enableLighting = false;
      // Smooth depth culling
      viewer.scene.globe.depthTestAgainstTerrain = false;
     // Lower SSE = Cesium requests higher-resolution tiles earlier = sharper map.
     // We use 2 (vs the default 2; previously 4) — safe with minimumZoomDistance=150m.
     viewer.scene.globe.maximumScreenSpaceError = 2;
     // Preload ancestor tiles so transitions are seamless.
     viewer.scene.globe.preloadAncestors = true;
     // Large tile cache so tiles don't unload on quick camera movements.
     viewer.scene.globe.tileCacheSize = 1000;

     // ── Render sharpness ──────────────────────────────────────────────────────
     // Set resolution scale to native DPR (capped at 2 for GPU budget).
     // Without this, the canvas renders at 1× and gets CSS-upscaled on retina,
     // producing the "blurry" look the user reported.
     viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 2);

     // FXAA reduces jagged edges on borders and labels.
     viewer.scene.postProcessStages.fxaa.enabled = true;

     // Fog makes distant tiles look washed-out / blurry.
     viewer.scene.fog.enabled = false;

      // ── Zoom limits — prevent camera from getting so close that tiles fail ──
      // OSM/Carto tiles stop at zoom 20 (~streetview level).  Cesium's camera
      // height of ~300 m corresponds to tile zoom 18-19 where tiles are fine.
      // Below ~100 m the tiles are gone and the globe turns black, so we clamp.
      const ctrl = viewer.scene.screenSpaceCameraController;
      ctrl.minimumZoomDistance = 150;    // metres — never zoom closer than 150 m
      ctrl.maximumZoomDistance = 2.5e7;  // 25 000 km — match our initial altitude

      // Remove atmosphere, sky box, sun, moon (matches dark brand / performance)
      if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = false;
      if (viewer.scene.skyBox) (viewer.scene.skyBox as any).show = false;
      if (viewer.scene.sun) viewer.scene.sun.show = false;
      if (viewer.scene.moon) viewer.scene.moon.show = false;
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#020202");

      // ── Prevent the Cesium canvas from propagating wheel events to the page ──
      // Without this, scrolling over the map also scrolls the browser page.
     const canvasEl = viewer.scene.canvas;
     const stopWheel = (e: WheelEvent) => e.stopPropagation();
     canvasEl.addEventListener("wheel", stopWheel, { passive: true });
     // Also block context-menu to avoid browser interfering with right-drag
     canvasEl.addEventListener("contextmenu", (e) => e.preventDefault());

     // ── Developer sharpness debug (Shift+S) ──────────────────────────────────
     const onDebugKey = (e: KeyboardEvent) => {
       if (e.shiftKey && e.key === "S") {
         const v = viewerRef.current;
         if (!v || v.isDestroyed()) return;
         const layer = v.imageryLayers.length > 0 ? v.imageryLayers.get(0) : null;
         console.group("[Atlas] Sharpness debug");
         console.log("devicePixelRatio:", window.devicePixelRatio);
         console.log("viewer.resolutionScale:", v.resolutionScale);
         console.log("globe.maximumScreenSpaceError:", v.scene.globe.maximumScreenSpaceError);
         console.log("tileCacheSize:", v.scene.globe.tileCacheSize);
         console.log("FXAA:", v.scene.postProcessStages.fxaa.enabled);
         console.log("fog:", v.scene.fog.enabled);
         if (layer) console.log("imagery.maximumLevel:", (layer.imageryProvider as any).maximumLevel);
         console.groupEnd();
       }
     };
     window.addEventListener("keydown", onDebugKey);

     // Keep resolutionScale in sync with DPR changes (retina plug-in/out).
     const onWindowResize = () => {
       if (!viewer.isDestroyed()) {
         viewer.resize();
         viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 2);
       }
     };
     window.addEventListener("resize", onWindowResize);

      // Add initial basemap
      const provider = makeProvider("osmDark");
      layerListenerRef.current = viewer.imageryLayers.addImageryProvider(provider);

      // Initial camera position (overview of the world)
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(-20, 25, 18_000_000),
      });

      viewerRef.current = viewer;

      // Load geo assets + setup layers
      initCityIndex();
      setupCountryBorders(viewer);
      setupStatesBorders(viewer);
      setupDCMarkers(viewer);
      setupRoutes(viewer);

      // Interaction handler
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

      // Click: select DC — or fire onMapClick for Site Brief when clicking globe
      handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const picked = viewer.scene.pick(event.position);
        if (picked?.id?.dcData) {
          onSelectDc?.(picked.id.dcData as DataCenter);
        } else {
          onSelectDc?.(null);
          setTooltip(null);
          // If no DC was clicked, fire map-click for Site Brief
          if (onMapClick) {
            const cartesian = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid);
            if (cartesian) {
              const carto = Cesium.Cartographic.fromCartesian(cartesian);
              const lat = Cesium.Math.toDegrees(carto.latitude);
              const lng = Cesium.Math.toDegrees(carto.longitude);
              onMapClick(lat, lng);
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Hover: tooltip (desktop)
      handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        const picked = viewer.scene.pick(event.endPosition);
        if (picked?.id?.dcData) {
          const dc = picked.id.dcData as DataCenter;
          setTooltip({ x: event.endPosition.x, y: event.endPosition.y, dc });
        } else {
          setTooltip(null);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      handlerRef.current = handler;
      setIsReady(true);

      return () => {
        window.removeEventListener("keydown", onDebugKey);
        window.removeEventListener("resize", onWindowResize);
        if (handlerRef.current && !handlerRef.current.isDestroyed()) {
          handlerRef.current.destroy();
        }
        // PrimitiveCollection is owned by viewer.scene.primitives; destroyed with viewer
        routePrimitivesRef.current = null;
        if (!viewer.isDestroyed()) viewer.destroy();
        viewerRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── helpers ────────────────────────────────────────────────────────────

    async function setupCountryBorders(viewer: Cesium.Viewer) {
      try {
        const source = await Cesium.GeoJsonDataSource.load("/geo/countries.geojson", {
          stroke: Cesium.Color.fromCssColorString("#f6f6fd").withAlpha(0.14),
          fill: Cesium.Color.TRANSPARENT,
          strokeWidth: 1,
          clampToGround: true,
        });
        countrySourceRef.current = source;
        source.name = "country-borders";
        viewer.dataSources.add(source);
      } catch (e) {
        console.warn("[AtlasMap] Country borders load failed:", e);
      }
    }

    async function setupStatesBorders(viewer: Cesium.Viewer) {
      try {
        const source = await Cesium.GeoJsonDataSource.load("/geo/states_provinces.geojson", {
          stroke: Cesium.Color.fromCssColorString("#f6f6fd").withAlpha(0.07),
          fill: Cesium.Color.TRANSPARENT,
          strokeWidth: 0.6,
          clampToGround: true,
        });
        stateSourceRef.current = source;
        source.name = "state-borders";
        source.show = false; // default off
        viewer.dataSources.add(source);
      } catch (e) {
        console.warn("[AtlasMap] State borders load failed:", e);
      }
    }

    function setupDCMarkers(viewer: Cesium.Viewer) {
      const source = new Cesium.CustomDataSource("data-centers");
      dcSourceRef.current = source;

      // EntityCluster for WORLD/REGION zoom levels
      source.clustering.enabled = true;
      source.clustering.pixelRange = 45;
      source.clustering.minimumClusterSize = 3;

      // Style the cluster label bubbles
      source.clustering.clusterEvent.addEventListener(
        (clustered: Cesium.Entity[], cluster: any) => {
          cluster.label.show = false;
          cluster.billboard.show = true;
          cluster.billboard.image = makeClusterCanvas(clustered.length);
          cluster.billboard.scale = 1;
          cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.CENTER;
          cluster.billboard.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
          cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
        }
      );

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
        // Attach DC data so it's accessible on pick
        (entity as any).dcData = dc;
      });

      viewer.dataSources.add(source);
    }

    async function setupRoutes(viewer: Cesium.Viewer) {
      try {
        const res = await fetch("/geo/submarine-cables.json");
        if (!res.ok) return;
        const geo = await res.json();

        // Collect all polyline segment arrays from both LineString and MultiLineString features
        const segments: { positions: Cesium.Cartesian3[]; color: string }[] = [];

        for (const feature of geo?.features ?? []) {
          const geomType: string = feature.geometry?.type ?? "";
          const rawColor: string = feature.properties?.color ?? "#696aac";

          let lineArrays: [number, number][][] = [];
          if (geomType === "LineString") {
            lineArrays = [feature.geometry.coordinates];
          } else if (geomType === "MultiLineString") {
            lineArrays = feature.geometry.coordinates;
          }

          for (const line of lineArrays) {
            if (!Array.isArray(line) || line.length < 2) continue;
            const positions = line.map(([lng, lat]: [number, number]) =>
              Cesium.Cartesian3.fromDegrees(lng, lat, 5000) // 5 km above surface so cables are visible
            );
            if (positions.length >= 2) segments.push({ positions, color: rawColor });
          }
        }

        console.info(
          `[AtlasMap] Fiber routes loaded: ${geo?.features?.length ?? 0} features → ${segments.length} polyline segments`
        );

        // Use a PolylineCollection (GPU primitive) for performance — much faster than
        // thousands of individual Entity polylines.
        const primitiveCollection = new Cesium.PrimitiveCollection();
        const polylineCollection = new Cesium.PolylineCollection();

        for (const { positions, color } of segments) {
          const cesiumColor = Cesium.Color.fromCssColorString(color).withAlpha(0.65);
          polylineCollection.add({
            positions,
            width: 1.5,
            material: Cesium.Material.fromType("Color", { color: cesiumColor }),
          });
        }

        primitiveCollection.add(polylineCollection);
        primitiveCollection.show = false; // toggled by layer effect below

        // Store on the primitive ref (not a data source this time)
        routePrimitivesRef.current = primitiveCollection;
        viewer.scene.primitives.add(primitiveCollection);

      } catch (e) {
        console.warn("[AtlasMap] Routes load failed:", e);
      }
    }

    // Draws a circular canvas for cluster bubbles
    function makeClusterCanvas(count: number): HTMLCanvasElement {
      const size = count > 99 ? 52 : count > 9 ? 46 : 38;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const r = size / 2;

      // Outer glow
      ctx.beginPath();
      ctx.arc(r, r, r - 1, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(105,106,172,0.25)";
      ctx.fill();

      // Inner circle
      ctx.beginPath();
      ctx.arc(r, r, r * 0.72, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(105,106,172,0.9)";
      ctx.fill();

      // Count text
      ctx.fillStyle = "#f6f6fd";
      ctx.font = `bold ${count > 99 ? 12 : 13}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(count), r, r);

      return canvas;
    }

    // ── basemap swap ───────────────────────────────────────────────────────
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(makeProvider(basemap));
    }, [basemap]);

    // ── layer visibility toggles ───────────────────────────────────────────
    useEffect(() => {
      const src = countrySourceRef.current;
      if (src) src.show = layers.countryBorders;
    }, [layers.countryBorders]);

    useEffect(() => {
      const src = stateSourceRef.current;
      if (src) src.show = layers.stateBorders;
    }, [layers.stateBorders]);

    useEffect(() => {
      const src = dcSourceRef.current;
      if (src) src.show = layers.points;
    }, [layers.points]);

    useEffect(() => {
      // Fiber routes are stored as a PrimitiveCollection (GPU path).
      // Show at REGION, LOCAL, and CITY zoom (not WORLD — too noisy at planetary scale).
      const prims = routePrimitivesRef.current;
      if (prims) {
        prims.show = layers.routes && cameraState.level !== "WORLD";
      }
      // Legacy CustomDataSource path (no-op if routes migrated to primitives)
      const src = routeSourceRef.current;
      if (src) {
        src.show = layers.routes && cameraState.level !== "WORLD";
      }
    }, [layers.routes, cameraState.level]);

    // ── cluster toggle based on zoom level ─────────────────────────────────
    useEffect(() => {
      const src = dcSourceRef.current;
      if (!src) return;
      src.clustering.enabled =
        cameraState.level === "WORLD" || cameraState.level === "REGION";
    }, [cameraState.level]);

    // ── city labels (imperative, LOD-driven) ───────────────────────────────
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;

      let source = citySourceRef.current;
      if (!source) {
        source = new Cesium.CustomDataSource("cities");
        citySourceRef.current = source;
        viewer.dataSources.add(source);
      }

      // Clear existing city labels
      source.entities.removeAll();

      if (!layers.cities || cameraState.level === "WORLD") return;

      const cities = getCitiesForLevel(cameraState);
      if (cities.length === 0) return;

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
            // Scale smaller cities smaller
            scale: city.scalerank <= 1 ? 1.2 : city.scalerank <= 3 ? 1.0 : 0.85,
          }),
          point: city.scalerank <= 3
            ? new Cesium.PointGraphics({
                pixelSize: 3,
                color: Cesium.Color.fromCssColorString("#a2a3e9").withAlpha(0.7),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                scaleByDistance: new Cesium.NearFarScalar(50_000, 1.2, 2_000_000, 0.5),
              })
            : undefined,
        });
      }
    // Depend on both level and viewRect so CITY level re-filters on pan
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layers.cities, cameraState.level, cameraState.viewRect]);

    // ── selected DC visual + basemap-aware colours ─────────────────────────
    useEffect(() => {
      const source = dcSourceRef.current;
      if (!source) return;
      const light = isLightBasemap(basemap);

      source.entities.values.forEach((entity) => {
        const dc = (entity as any).dcData as DataCenter | undefined;
        if (!dc || !entity.point) return;
        const pt = entity.point;
        const isSelected = dc.id === selectedId;
        const isHighlighted = !highlightIds || highlightIds.includes(dc.id);

        pt.pixelSize = new Cesium.ConstantProperty(
          tierPixelSize(dc.tier) + (isSelected ? 7 : 0)
        );
        pt.color = new Cesium.ConstantProperty(
          isSelected
            ? Cesium.Color.fromCssColorString("#8587e3")
            : !isHighlighted
            ? tierColor(dc.tier, light).withAlpha(0.25)
            : tierColor(dc.tier, light)
        );
        // Stronger outline on light basemaps so dots pop
        pt.outlineColor = new Cesium.ConstantProperty(
          isSelected
            ? Cesium.Color.WHITE
            : light
            ? Cesium.Color.fromCssColorString("#1a1b2e").withAlpha(0.7)
            : Cesium.Color.BLACK.withAlpha(0.45)
        );
        pt.outlineWidth = new Cesium.ConstantProperty(
          isSelected ? 3 : light ? 2 : 1
        );
      });
    }, [selectedId, highlightIds, basemap]);

    // ── power heatmap ──────────────────────────────────────────────────────
    // Fetches viewport grid scores and renders colored rectangle primitives.
    // Throttled: only re-fetches when viewRect changes materially.
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;

      // Clear existing heatmap primitives
      if (powerHeatmapRef.current) {
        if (!viewer.scene.primitives.contains(powerHeatmapRef.current)) {
          // Already removed (e.g. viewer was recreated)
        } else {
          viewer.scene.primitives.remove(powerHeatmapRef.current);
        }
        powerHeatmapRef.current = null;
      }

      if (!layers.powerHeatmap) return;
      if (cameraState.level === "WORLD") return; // too zoomed out
      const rect = cameraState.viewRect;
      if (!rect) return;

      // Abort any in-flight request
      powerHeatmapFetchRef.current?.abort();
      const controller = new AbortController();
      powerHeatmapFetchRef.current = controller;

      const gridResolution = cameraState.level === "CITY" ? 15 : 10;
      const mw = powerScenario?.targetMw ?? 100;

      const url = `/api/power/viewport?west=${rect.west.toFixed(4)}&south=${rect.south.toFixed(4)}&east=${rect.east.toFixed(4)}&north=${rect.north.toFixed(4)}&mw=${mw}&grid=${gridResolution}`;

      fetch(url, { signal: controller.signal })
        .then((r) => r.json())
        .then((data: { cells?: Array<{ west: number; south: number; east: number; north: number; score: number; color: { r: number; g: number; b: number; a: number } }> }) => {
          if (controller.signal.aborted) return;
          const vwr = viewerRef.current;
          if (!vwr || vwr.isDestroyed()) return;

          const collection = new Cesium.PrimitiveCollection();

          for (const cell of data.cells ?? []) {
            const { r, g, b, a } = cell.color;
            const instances = [
              new Cesium.GeometryInstance({
                geometry: new Cesium.RectangleGeometry({
                  rectangle: Cesium.Rectangle.fromDegrees(cell.west, cell.south, cell.east, cell.north),
                  height: 100,
                }),
                attributes: {
                  color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    new Cesium.Color(r, g, b, a)
                  ),
                },
              }),
            ];
            collection.add(new Cesium.Primitive({
              geometryInstances: instances,
              appearance: new Cesium.PerInstanceColorAppearance({ flat: true }),
              asynchronous: false,
            }));
          }

          powerHeatmapRef.current = collection;
          vwr.scene.primitives.add(collection);
        })
        .catch(() => { /* aborted or network error — silent */ });

      return () => { controller.abort(); };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layers.powerHeatmap, cameraState.level, cameraState.viewRect, powerScenario?.targetMw]);

    // ── power generation layer ──────────────────────────────────────────────
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;

      // Get or create source
      let source = powerGenSourceRef.current;
      if (!source) {
        source = new Cesium.CustomDataSource("power-generation");
        powerGenSourceRef.current = source;
        viewer.dataSources.add(source);
      }

      source.entities.removeAll();
      source.show = layers.powerGeneration;

      if (!layers.powerGeneration) return;
      if (cameraState.level === "WORLD") return;

      // Import static plants and render in view
      import("@/lib/power/staticReferenceData").then(({ STATIC_LARGE_PLANTS }) => {
        const src = powerGenSourceRef.current;
        if (!src) return;
        const rect = cameraState.viewRect;
        const BUF = 2; // degree buffer

        const visible = rect
          ? STATIC_LARGE_PLANTS.filter(
              (p) => p.lat >= rect.south - BUF && p.lat <= rect.north + BUF &&
                     p.lng >= rect.west - BUF && p.lng <= rect.east + BUF
            )
          : STATIC_LARGE_PLANTS;

        const FUEL_COLORS: Record<string, string> = {
          NUC: "#60a5fa", WAT: "#34d399", NG: "#f97316", SUN: "#fbbf24",
          WND: "#a78bfa", COL: "#6b7280", SUB: "#6b7280", BAT: "#ec4899",
          GEO: "#84cc16",
        };

        for (const plant of visible) {
          const color = Cesium.Color.fromCssColorString(FUEL_COLORS[plant.fuelType] ?? "#94a3b8");
          const sizePx = Math.min(16, Math.max(6, Math.sqrt(plant.capacityMw / 100) * 4));
          const entity = src.entities.add({
            position: Cesium.Cartesian3.fromDegrees(plant.lng, plant.lat, 2000),
            point: new Cesium.PointGraphics({
              pixelSize: sizePx,
              color: color.withAlpha(0.85),
              outlineColor: Cesium.Color.BLACK.withAlpha(0.5),
              outlineWidth: 1.5,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              scaleByDistance: new Cesium.NearFarScalar(100_000, 1.4, 5_000_000, 0.5),
            }),
          });
          const fuelLabel: Record<string, string> = {
            NUC: "Nuclear", WAT: "Hydro", NG: "Gas", SUN: "Solar",
            WND: "Wind", COL: "Coal", SUB: "Coal", BAT: "Battery",
          };
          (entity as any).genData = plant;
          // Add label for important plants
          if (plant.capacityMw >= 2000) {
            entity.label = new Cesium.LabelGraphics({
              text: `${plant.name}\n${Math.round(plant.capacityMw)} MW`,
              font: "600 11px system-ui, -apple-system, sans-serif",
              fillColor: color,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -20),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3_000_000),
              scaleByDistance: new Cesium.NearFarScalar(100_000, 1.0, 3_000_000, 0.5),
            });
          }
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layers.powerGeneration, cameraState.level, cameraState.viewRect]);

    // ── render ─────────────────────────────────────────────────────────────
    return (
      // overscroll-none + overflow-hidden prevent the map from triggering
      // elastic scroll or page scroll on desktop and mobile.
      <div className="absolute inset-0 w-full h-full bg-[#020202] overflow-hidden overscroll-none">
        {/*
          Minimal Cesium canvas styles. We skip importing the full widgets.css
          because that file is processed by Cesium's webpack pipeline and
          conflicts with PayloadCMS's SCSS loader in Next.js.
        */}
        <style>{`
          .cesium-viewer,.cesium-widget{position:relative;overflow:hidden;width:100%;height:100%;}
          .cesium-widget canvas{width:100%;height:100%;touch-action:none;overscroll-behavior:none;}
          .cesium-viewer-cesiumWidgetContainer{width:100%;height:100%;}
          .cesium-credit-container,.cesium-widget-credits{display:none!important;}
        `}</style>
        {/* Cesium mounts into this div */}
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />

        {/* Loading veil */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#020202] text-[rgba(246,246,253,0.5)] text-sm z-10">
            Loading map…
          </div>
        )}

        {/* Hover tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-20 bg-[rgba(6,7,15,0.92)] backdrop-blur-sm border border-[rgba(246,246,253,0.1)] rounded-xl px-3 py-2 shadow-lg max-w-[220px]"
            style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
          >
            <p className="text-sm font-semibold text-[#f6f6fd] leading-snug">
              {tooltip.dc.name}
            </p>
            <p className="text-xs text-[rgba(246,246,253,0.55)] mt-0.5">
              {[tooltip.dc.city, tooltip.dc.stateOrRegion, tooltip.dc.country]
                .filter(Boolean)
                .join(", ")}
            </p>
            {tooltip.dc.capabilities.length > 0 && (
              <p className="text-[11px] text-[rgba(162,163,233,0.8)] mt-1">
                {tooltip.dc.capabilities.slice(0, 3).join(", ")}
              </p>
            )}
            {tooltip.dc.confidence != null && (
              <p className="text-[10px] text-[rgba(246,246,253,0.3)] mt-1.5 uppercase tracking-wide">
                {tooltip.dc.source ?? "curated"} · {tooltip.dc.confidence}% conf.
              </p>
            )}
          </div>
        )}

        {/* Attribution bar — bottom-center, always visible */}
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-3 py-1 rounded-full bg-[rgba(2,2,2,0.55)] backdrop-blur-sm">
          <span className="text-[10px] text-[rgba(246,246,253,0.45)]">
            © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">OpenStreetMap</a>
            {" "}contributors · <a href="https://carto.com/attributions" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">Carto</a>
            {" "}· <a href="https://www.peeringdb.com" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">PeeringDB</a>
            {" "}· <a href="https://www.wikidata.org" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">Wikidata CC0</a>
            {" "}· <a href="https://www.telegeography.com" target="_blank" rel="noopener" className="pointer-events-auto hover:text-[rgba(246,246,253,0.7)] transition-colors">TeleGeography</a> (submarine cables)
          </span>
        </div>
      </div>
    );
  }
);

AtlasMap.displayName = "AtlasMap";
export default AtlasMap;
