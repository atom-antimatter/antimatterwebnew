"use client";

import Globe from "react-globe.gl";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DATA_CENTERS } from "@/data/dataCenters";

// Tiny 1x1 dark texture so we don't need an external asset (BRAND_GUIDE: #020202 background)
const DARK_TEXTURE_1PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

/** Submarine cable (fiber) route: array of [lng, lat] and optional name/color. */
export type FiberPath = { coords: [number, number][]; name?: string; color?: string };

export type DataCenterGlobeRef = {
  pointOfView: (pos: { lat: number; lng: number; altitude?: number }, transitionMs?: number) => void;
};

type DataCenterGlobeProps = {
  /** When false, pause or slow animation (e.g. when offscreen). */
  active?: boolean;
  /** Ref to control camera (pointOfView) from parent (e.g. search zoom). */
  globeRef?: React.RefObject<DataCenterGlobeRef | null>;
};

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

/** Load submarine cable (fiber) GeoJSON from public/geo. Dataset is fiber routes, not graticules. */
async function loadFiberRoutes(): Promise<FiberPath[]> {
  const res = await fetch("/geo/submarine-cables.json");
  if (!res.ok) return [];
  const geo = await res.json();
  if (!geo?.features?.length) return [];
  const paths: FiberPath[] = [];
  for (const f of geo.features) {
    const coords = f.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;
    paths.push({
      coords,
      name: f.properties?.name,
      color: f.properties?.color ?? "#696aac",
    });
  }
  return paths;
}

export default function DataCenterGlobe({ active = true, globeRef: externalRef }: DataCenterGlobeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<any>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [fiberPaths, setFiberPaths] = useState<FiberPath[]>([]);

  useEffect(() => {
    loadFiberRoutes().then(setFiberPaths);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize((prev) => {
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);
        return prev.w === w && prev.h === h ? prev : { w, h };
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Expose pointOfView to parent
  useEffect(() => {
    if (!externalRef) return;
    const globe = globeRef.current;
    if (!globe?.pointOfView) return;
    (externalRef as React.MutableRefObject<DataCenterGlobeRef | null>).current = {
      pointOfView: (pos, transitionMs) => globe.pointOfView(pos, transitionMs),
    };
    return () => {
      (externalRef as React.MutableRefObject<DataCenterGlobeRef | null>).current = null;
    };
  }, [externalRef]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls?.();
    if (controls) {
      controls.autoRotate = active && !reducedMotion;
      controls.autoRotateSpeed = 0.2;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.minPolarAngle = Math.PI * 0.2;
      controls.maxPolarAngle = Math.PI * 0.85;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
    }

    // BRAND_GUIDE: dark base (#020202), subtle emissive for depth
    const mat = globe.globeMaterial?.() as THREE.MeshPhongMaterial | undefined;
    if (mat) {
      mat.color = new THREE.Color("#020202");
      mat.emissive = new THREE.Color("#0a0b14");
      mat.emissiveIntensity = 0.85;
      mat.shininess = 0.35;
      mat.needsUpdate = true;
    }

    const initialAlt = 2.0;
    globe.pointOfView?.({ lat: 20, lng: -30, altitude: initialAlt }, reducedMotion ? 0 : 0);
  }, [active, reducedMotion]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    if (!active && typeof globe.pauseAnimation === "function") globe.pauseAnimation();
    if (active && typeof globe.resumeAnimation === "function") globe.resumeAnimation();
  }, [active]);

  const pointsData = [...DATA_CENTERS];

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-[#020202]">
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(2,2,2,0)"
        rendererConfig={{ antialias: true, alpha: true }}
        globeImageUrl={DARK_TEXTURE_1PX}
        bumpImageUrl={DARK_TEXTURE_1PX}
        showAtmosphere={false}
        animateIn={true}
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.01}
        pointColor={() => "rgba(162, 163, 233, 0.9)"}
        pointRadius={0.35}
        pointLabel={(d: object) => {
          const dc = d as { name: string; city: string; country: string };
          return `${dc.name} — ${dc.city}, ${dc.country}`;
        }}
        pathsData={fiberPaths}
        pathPoints="coords"
        pathPointLat={(p: [number, number]) => p[1]}
        pathPointLng={(p: [number, number]) => p[0]}
        pathColor={(d: object) => (d as FiberPath).color ?? "#696aac"}
        pathStroke={1.2}
        pathDashLength={0.1}
        pathDashGap={0.008}
        pathDashAnimateTime={reducedMotion ? 0 : 12000}
        pathLabel={(d: object) => (d as FiberPath).name ?? "Fiber route"}
      />
    </div>
  );
}
