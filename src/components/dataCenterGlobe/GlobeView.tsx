"use client";

import Globe from "react-globe.gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { DATA_CENTERS, type DataCenter } from "@/data/dataCenters";

// ─── textures ─────────────────────────────────────────────────────────────────
const GLOBE_IMAGE_URL = "https://unpkg.com/three-globe/example/img/earth-dark.jpg";

// ─── types ────────────────────────────────────────────────────────────────────

export type GlobeViewRef = {
  pointOfView: (pos: { lat: number; lng: number; altitude?: number }, transitionMs?: number) => void;
};

type GeoJsonFeature = {
  type: string;
  geometry: { type: string; coordinates: number[] | number[][] | number[][][] };
  properties?: Record<string, unknown>;
};

type ArcDatum = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  label: string;
  color: string;
};

export type GlobeViewProps = {
  active?: boolean;
  globeRef?: React.RefObject<GlobeViewRef | null>;
  selectedId?: string | null;
  onSelectDc?: (dc: DataCenter | null) => void;
  highlightIds?: string[] | null;
  showCountryBorders?: boolean;
  showStateBorders?: boolean;
  showRoutes?: boolean;
  showPoints?: boolean;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const update = () => setReduced(Boolean(mq.matches));
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

async function loadGeoJson(path: string): Promise<GeoJsonFeature[]> {
  const res = await fetch(path);
  if (!res.ok) return [];
  const geo = await res.json();
  return (geo?.features ?? []).filter(
    (f: GeoJsonFeature) =>
      f.geometry &&
      (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon")
  );
}

type FiberPath = { coords: [number, number][]; name?: string; color?: string };

async function loadFiberRoutes(): Promise<FiberPath[]> {
  const res = await fetch("/geo/submarine-cables.json");
  if (!res.ok) return [];
  const geo = await res.json();
  const paths: FiberPath[] = [];
  for (const f of geo?.features ?? []) {
    const coords = f.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;
    paths.push({ coords, name: f.properties?.name, color: f.properties?.color ?? "#696aac" });
  }
  return paths;
}

// Tier → visual radius
function tierRadius(tier: DataCenter["tier"]): number {
  switch (tier) {
    case "hyperscale": return 0.72;
    case "core": return 0.55;
    case "enterprise": return 0.48;
    case "edge": return 0.38;
    default: return 0.5;
  }
}

// Tier → point color
function tierColor(tier: DataCenter["tier"]): string {
  switch (tier) {
    case "hyperscale": return "rgba(133, 135, 227, 0.97)";
    case "core": return "rgba(162, 163, 233, 0.93)";
    case "enterprise": return "rgba(199, 200, 242, 0.88)";
    case "edge": return "rgba(105, 106, 172, 0.9)";
    default: return "rgba(162, 163, 233, 0.85)";
  }
}

// ─── inject pulse animation CSS once ─────────────────────────────────────────
function injectGlobeStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("gv-styles")) return;
  const style = document.createElement("style");
  style.id = "gv-styles";
  style.textContent = `
    .gv-ring {
      width: 22px; height: 22px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.92);
      box-shadow: 0 0 14px rgba(162,163,233,0.7);
      animation: gv-pulse 1.6s ease-out infinite;
      pointer-events: none;
    }
    @keyframes gv-pulse {
      0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.9; }
      100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ─── component ────────────────────────────────────────────────────────────────

export default function GlobeView({
  active = true,
  globeRef: externalRef,
  selectedId,
  onSelectDc,
  highlightIds,
  showCountryBorders = true,
  showStateBorders = false,
  showRoutes = true,
  showPoints = true,
}: GlobeViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const internalRef = useRef<any>(null);
  const reducedMotion = usePrefersReducedMotion();

  const [size, setSize] = useState({ w: 1280, h: 800 });
  const [fiberPaths, setFiberPaths] = useState<FiberPath[]>([]);
  const [countryPolygons, setCountryPolygons] = useState<GeoJsonFeature[]>([]);
  const [statePolygons, setStatePolygons] = useState<GeoJsonFeature[]>([]);
  const [statesLoaded, setStatesLoaded] = useState(false);

  // Inject pulse CSS once
  useEffect(() => { injectGlobeStyles(); }, []);

  // Load geo assets
  useEffect(() => {
    loadFiberRoutes().then(setFiberPaths);
    loadGeoJson("/geo/countries.geojson").then(setCountryPolygons);
  }, []);

  // Lazy-load states only when toggled on
  useEffect(() => {
    if (!showStateBorders || statesLoaded) return;
    loadGeoJson("/geo/states.geojson")
      .then(setStatePolygons)
      .finally(() => setStatesLoaded(true));
  }, [showStateBorders, statesLoaded]);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize((prev) => {
        const w = Math.floor(r.width);
        const h = Math.floor(r.height);
        return prev.w === w && prev.h === h ? prev : { w, h };
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Expose pointOfView to parent
  useEffect(() => {
    if (!externalRef) return;
    const globe = internalRef.current;
    if (!globe?.pointOfView) return;
    (externalRef as React.MutableRefObject<GlobeViewRef | null>).current = {
      pointOfView: (pos, ms) => globe.pointOfView(pos, ms),
    };
    return () => {
      (externalRef as React.MutableRefObject<GlobeViewRef | null>).current = null;
    };
  });

  // Globe settings after mount
  useEffect(() => {
    const globe = internalRef.current;
    if (!globe) return;

    const controls = globe.controls?.();
    if (controls) {
      controls.autoRotate = active && !reducedMotion && !selectedId;
      controls.autoRotateSpeed = 0.18;
      controls.enableZoom = true;
      controls.enablePan = false;
      controls.minPolarAngle = Math.PI * 0.18;
      controls.maxPolarAngle = Math.PI * 0.86;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
    }

    const mat = globe.globeMaterial?.() as THREE.MeshPhongMaterial | undefined;
    if (mat) {
      mat.color = new THREE.Color("#0b0c1a");
      mat.emissive = new THREE.Color("#0a0b14");
      mat.emissiveIntensity = 0.12;
      mat.shininess = 0.5;
      mat.needsUpdate = true;
    }

    globe.pointOfView?.({ lat: 20, lng: -20, altitude: 2.1 }, 0);
  }, [active, reducedMotion, selectedId]);

  // Pause / resume
  useEffect(() => {
    const globe = internalRef.current;
    if (!globe) return;
    if (!active && typeof globe.pauseAnimation === "function") globe.pauseAnimation();
    if (active && typeof globe.resumeAnimation === "function") globe.resumeAnimation();
  }, [active]);

  // ─── derived data ────────────────────────────────────────────────────────

  // Points
  const pointsData = useMemo(() => (showPoints ? [...DATA_CENTERS] : []), [showPoints]);

  const pointRadius = useCallback(
    (d: object) => {
      const dc = d as DataCenter;
      const base = tierRadius(dc.tier);
      if (dc.id === selectedId) return base + 0.32;
      // Dim non-highlighted points when there's an active filter
      if (highlightIds && highlightIds.length > 0 && !highlightIds.includes(dc.id)) return base * 0.45;
      return base;
    },
    [selectedId, highlightIds]
  );

  const pointColor = useCallback(
    (d: object) => {
      const dc = d as DataCenter;
      if (dc.id === selectedId) return "rgba(255, 255, 255, 1.0)";
      if (highlightIds && highlightIds.length > 0 && !highlightIds.includes(dc.id))
        return "rgba(105, 106, 172, 0.25)";
      if (dc.status === "planned") return "rgba(162, 163, 233, 0.45)";
      return tierColor(dc.tier);
    },
    [selectedId, highlightIds]
  );

  const pointLabel = useCallback((d: object) => {
    const dc = d as DataCenter;
    const loc = [dc.city, dc.stateOrRegion, dc.country].filter(Boolean).join(", ");
    const caps = dc.capabilities.slice(0, 3).join(", ");
    const planned = dc.status === "planned" ? " [planned]" : "";
    return `<div style="background:rgba(6,7,15,0.9);border:1px solid rgba(105,106,172,0.3);border-radius:8px;padding:8px 10px;font-family:sans-serif;font-size:12px;color:#f6f6fd;max-width:220px;pointer-events:none">
      <div style="font-weight:600;margin-bottom:2px">${dc.name}${planned}</div>
      <div style="color:rgba(162,163,233,0.8);margin-bottom:4px">${loc}</div>
      ${dc.provider ? `<div style="color:rgba(199,200,242,0.7);font-size:11px">${dc.provider}</div>` : ""}
      ${caps ? `<div style="color:rgba(105,106,172,0.9);font-size:11px;margin-top:3px">${caps}</div>` : ""}
    </div>`;
  }, []);

  // HTML ring for selected point
  const selectedHtmlData = useMemo(() => {
    if (!selectedId) return [];
    const dc = DATA_CENTERS.find((d) => d.id === selectedId);
    return dc ? [dc] : [];
  }, [selectedId]);

  // Arc data for selected DC connections
  const arcData = useMemo((): ArcDatum[] => {
    if (!selectedId) return [];
    const dc = DATA_CENTERS.find((d) => d.id === selectedId);
    if (!dc?.connections?.length) return [];
    return dc.connections.flatMap((conn) => {
      const target = DATA_CENTERS.find((d) => d.id === conn.toId);
      if (!target) return [];
      const color =
        conn.type === "direct-connect"
          ? "rgba(199,200,242,0.55)"
          : conn.type === "private-backbone"
          ? "rgba(133,135,227,0.5)"
          : "rgba(105,106,172,0.4)";
      return [{ startLat: dc.lat, startLng: dc.lng, endLat: target.lat, endLng: target.lng, label: conn.type, color }];
    });
  }, [selectedId]);

  // Combined country + state polygons based on layer toggles
  const activePolygons = useMemo(() => {
    const result: GeoJsonFeature[] = [];
    if (showCountryBorders) result.push(...countryPolygons);
    if (showStateBorders) result.push(...statePolygons);
    return result;
  }, [showCountryBorders, showStateBorders, countryPolygons, statePolygons]);

  // Fiber paths (only when showRoutes, dim when a DC is selected)
  const activeFiberPaths = useMemo(
    () => (showRoutes ? fiberPaths : []),
    [showRoutes, fiberPaths]
  );

  // ─── event handlers ──────────────────────────────────────────────────────

  const handlePointClick = useCallback(
    (d: object) => {
      const dc = d as DataCenter;
      onSelectDc?.(dc);
      // Stop auto-rotate on selection
      const controls = internalRef.current?.controls?.();
      if (controls) controls.autoRotate = false;
    },
    [onSelectDc]
  );

  const handleGlobeClick = useCallback(() => {
    if (selectedId) onSelectDc?.(null);
  }, [selectedId, onSelectDc]);

  // ─── render ──────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-[#020202]">
      <Globe
        ref={internalRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(2,2,2,0)"
        rendererConfig={{ antialias: true, alpha: true }}
        globeImageUrl={GLOBE_IMAGE_URL}
        bumpImageUrl={null}
        showAtmosphere={true}
        atmosphereColor="#5b5c9a"
        atmosphereAltitude={0.18}
        animateIn={true}
        // Country / state border polygons
        polygonsData={activePolygons}
        polygonGeoJsonGeometry={(d: object) =>
          (d as GeoJsonFeature).geometry as { type: string; coordinates: number[] }
        }
        polygonCapColor="rgba(0,0,0,0)"
        polygonSideColor="rgba(0,0,0,0)"
        polygonStrokeColor="rgba(246,246,253,0.13)"
        polygonAltitude={0.001}
        // Data center points
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.018}
        pointColor={pointColor}
        pointRadius={pointRadius}
        pointsMerge={false}
        pointLabel={pointLabel}
        onPointClick={handlePointClick}
        // Selection pulse ring
        htmlElementsData={selectedHtmlData}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.022}
        htmlElement={(d: object) => {
          void d;
          const el = document.createElement("div");
          el.className = "gv-ring";
          return el;
        }}
        // Connection arcs
        arcsData={arcData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcStroke={1.5}
        arcDashLength={0.35}
        arcDashGap={0.08}
        arcDashAnimateTime={reducedMotion ? 0 : 3500}
        arcLabel="label"
        arcAltitudeAutoScale={0.4}
        // Fiber paths
        pathsData={activeFiberPaths}
        pathPoints="coords"
        pathPointLat={(p: [number, number]) => p[1]}
        pathPointLng={(p: [number, number]) => p[0]}
        pathColor={(d: object) => (d as FiberPath).color ?? "#696aac"}
        pathStroke={selectedId ? 0.6 : 1.8}
        pathDashLength={0.1}
        pathDashGap={0.006}
        pathDashAnimateTime={reducedMotion ? 0 : 14000}
        pathLabel={(d: object) => (d as FiberPath).name ?? "Fiber route"}
        onGlobeClick={handleGlobeClick}
      />
    </div>
  );
}
