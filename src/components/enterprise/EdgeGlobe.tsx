"use client";

import Globe from "react-globe.gl";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type LatLng = { lat: number; lng: number };

type GlobePoint = LatLng & {
  kind: "land" | "marker";
  size: number;
  color: string;
  label?: string;
};

const ACCENT = "#7B7CFF";
const LAND_DOT = "rgba(255,255,255,0.28)";

// Tiny 1x1 black PNG so we don't need a texture asset or external fetch.
const BLACK_TEXTURE_1PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

const EDGE_REGIONS: Array<{ name: string; lat: number; lng: number; color?: string }> = [
  { name: "US East", lat: 39.0, lng: -77.5 },
  { name: "US Central", lat: 41.9, lng: -87.6 },
  { name: "US West", lat: 34.0, lng: -118.2 },
  { name: "London", lat: 51.5, lng: -0.1 },
  { name: "Frankfurt", lat: 50.1, lng: 8.7 },
  { name: "Singapore", lat: 1.35, lng: 103.8 },
  { name: "Tokyo", lat: 35.7, lng: 139.7 },
  { name: "Sydney", lat: -33.9, lng: 151.2 },
  { name: "São Paulo", lat: -23.5, lng: -46.6 },
];

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

async function loadLandGeoJson() {
  const res = await fetch("/geo/land-110m.json");
  if (!res.ok) throw new Error("Failed to load land data");
  const topo = await res.json();
  return feature(topo, topo.objects.land);
}

function generateLandDots(
  landGeo: any,
  opts: { stepDeg: number; probability: number; maxDots: number }
): Array<LatLng> {
  const { stepDeg, probability, maxDots } = opts;
  const pts: Array<LatLng> = [];

  // Avoid polar regions for a nicer “template-like” look.
  for (let lat = -58; lat <= 78; lat += stepDeg) {
    for (let lng = -180; lng <= 180; lng += stepDeg) {
      if (Math.random() > probability) continue;
      const jLat = lat + (Math.random() - 0.5) * stepDeg * 0.6;
      const jLng = lng + (Math.random() - 0.5) * stepDeg * 0.6;
      if (geoContains(landGeo, [jLng, jLat])) {
        pts.push({ lat: jLat, lng: jLng });
        if (pts.length >= maxDots) return pts;
      }
    }
  }
  return pts;
}

export default function EdgeGlobe() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<any>(null);
  const reducedMotion = usePrefersReducedMotion();

  const [landDots, setLandDots] = useState<Array<LatLng> | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 420, h: 420 });

  const isMobile = useMemo(() => (typeof window === "undefined" ? false : window.innerWidth < 768), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(320, Math.floor(rect.width));
      setSize({ w, h: w });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const landGeo = await loadLandGeoJson();
        if (cancelled) return;

        const dots = generateLandDots(landGeo, {
          stepDeg: isMobile ? 3.6 : 2.8,
          probability: isMobile ? 0.18 : 0.28,
          maxDots: isMobile ? 1400 : 2400,
        });
        if (!cancelled) setLandDots(dots);
      } catch {
        if (!cancelled) setLandDots([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isMobile]);

  const pointsData: GlobePoint[] = useMemo(() => {
    const markersCount = isMobile ? 7 : EDGE_REGIONS.length;
    const markers = EDGE_REGIONS.slice(0, markersCount).map((r) => ({
      kind: "marker" as const,
      lat: r.lat,
      lng: r.lng,
      size: isMobile ? 0.58 : 0.7,
      color: r.color ?? "rgba(220, 214, 255, 0.92)",
      label: r.name,
    }));

    const land = (landDots ?? []).map((p) => ({
      kind: "land" as const,
      lat: p.lat,
      lng: p.lng,
      size: 0.18,
      color: LAND_DOT,
    }));

    return [...land, ...markers];
  }, [isMobile, landDots]);

  const ringsData = useMemo(() => {
    if (reducedMotion) return [];
    const markersCount = isMobile ? 6 : EDGE_REGIONS.length;
    return EDGE_REGIONS.slice(0, markersCount).map((r) => ({
      lat: r.lat,
      lng: r.lng,
      maxR: isMobile ? 1.6 : 2.1,
      propagationSpeed: isMobile ? 1.3 : 1.6,
      repeatPeriod: isMobile ? 2400 : 2000,
    }));
  }, [isMobile, reducedMotion]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    // Controls
    const controls = globe.controls?.();
    if (controls) {
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.autoRotate = !reducedMotion;
      controls.autoRotateSpeed = 0.35;
      controls.rotateSpeed = 0.35;
    }

    // Pixel ratio tuning (mobile-friendly)
    const renderer = globe.renderer?.();
    if (renderer) {
      const dpr = isMobile ? Math.min(1.25, window.devicePixelRatio || 1) : Math.min(1.6, window.devicePixelRatio || 1);
      renderer.setPixelRatio(dpr);
    }

    // Globe material: near-black with a faint emissive tint.
    const mat = globe.globeMaterial?.() as THREE.MeshPhongMaterial | undefined;
    if (mat) {
      mat.color = new THREE.Color("#05060A");
      mat.emissive = new THREE.Color("#090A12");
      mat.emissiveIntensity = 0.6;
      mat.shininess = 0.2;
      mat.needsUpdate = true;
    }
  }, [isMobile, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[520px] xl:max-w-[600px] mx-auto aspect-square"
    >
      {/* Subtle vignette / halo overlay (cheap + matches Framer vibe) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 55%, rgba(123,124,255,0.18) 0%, rgba(123,124,255,0.06) 28%, rgba(0,0,0,0) 60%)",
          filter: "blur(0px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow: "0 0 120px rgba(123,124,255,0.18)",
        }}
      />

      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        rendererConfig={{ antialias: true, alpha: true }}
        globeImageUrl={BLACK_TEXTURE_1PX}
        bumpImageUrl={BLACK_TEXTURE_1PX}
        showAtmosphere={true}
        atmosphereColor={ACCENT}
        atmosphereAltitude={0.22}
        // Base dotted land + marker points
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.002}
        pointColor={(d: any) => d.color}
        pointRadius={(d: any) => d.size}
        // Glow rings on markers (subtle)
        ringsData={ringsData as any}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => [`rgba(123,124,255,0.45)`, "rgba(123,124,255,0)"]}
        ringMaxRadius={(d: any) => d.maxR}
        ringPropagationSpeed={(d: any) => d.propagationSpeed}
        ringRepeatPeriod={(d: any) => d.repeatPeriod}
        // Keep UX tight
        animateIn={true}
      />
    </div>
  );
}


