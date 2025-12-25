"use client";

import Globe from "react-globe.gl";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./EdgeGlobe.module.css";
import { EDGE_GLOBE_LOCATIONS, type EdgeLocation } from "@/data/edgeGlobeLocations";

type LatLng = { lat: number; lng: number };

type GlobePoint = LatLng & {
  kind: "land";
  size: number;
  color: string;
};

const LAND_DOT = "rgba(255,255,255,0.34)";

// Tiny 1x1 black PNG so we don't need a texture asset or external fetch.
const BLACK_TEXTURE_1PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

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

let landGeoPromise: Promise<any> | null = null;
let landDotsDesktop: Array<LatLng> | null = null;
let landDotsMobile: Array<LatLng> | null = null;

function requestIdle(cb: () => void, timeoutMs = 1200) {
  const w = window as any;
  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(cb, { timeout: timeoutMs });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 60);
  return () => window.clearTimeout(id);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function generateLandDots(
  landGeo: any,
  opts: { stepDeg: number; maxDots: number }
): Array<LatLng> {
  const { stepDeg, maxDots } = opts;
  const pts: Array<LatLng> = [];

  // Avoid extreme polar regions for a cleaner “template-like” look.
  for (let lat = -60; lat <= 80; lat += stepDeg) {
    for (let lng = -180; lng <= 180; lng += stepDeg) {
      // Deterministic grid (no jitter) makes the land read like a dot-matrix.
      if (geoContains(landGeo, [lng, lat])) {
        pts.push({ lat, lng });
        if (pts.length >= maxDots) return pts;
      }
    }
  }
  return pts;
}

type EdgeGlobeProps = {
  /**
   * When false, stop/slow animation work (used when offscreen).
   */
  active?: boolean;
  /**
   * Called once when the globe has mounted and is ready to be revealed.
   */
  onReady?: () => void;
};

export default function EdgeGlobe({ active = true, onReady }: EdgeGlobeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<any>(null);
  const reducedMotion = usePrefersReducedMotion();

  const [landDots, setLandDots] = useState<Array<LatLng> | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 420, h: 420 });
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const readyFiredRef = useRef(false);

  const isMobile = size.w < 420;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        // Keep the canvas square, but NEVER change the wrapper layout height.
        const s = Math.floor(Math.min(rect.width, rect.height));
        const w = clamp(s, 320, 700);
        setSize((prev) => (prev.w === w ? prev : { w, h: w }));
      });
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Use cached dots if already computed.
    const cached = isMobile ? landDotsMobile : landDotsDesktop;
    if (cached) {
      setLandDots(cached);
      return () => {
        cancelled = true;
      };
    }

    // Defer heavy geoContains loops to idle time to avoid scroll jank.
    const cancelIdle = requestIdle(() => {
      (async () => {
        try {
          landGeoPromise = landGeoPromise ?? loadLandGeoJson();
          const landGeo = await landGeoPromise;
          if (cancelled) return;

          const dots = generateLandDots(landGeo, {
            stepDeg: isMobile ? 3.2 : 2.2,
            maxDots: isMobile ? 2200 : 5600,
          });
          if (isMobile) landDotsMobile = dots;
          else landDotsDesktop = dots;
          if (!cancelled) setLandDots(dots);
        } catch {
          if (!cancelled) setLandDots([]);
        }
      })();
    }, 1600);

    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [isMobile]);

  const pointsData: GlobePoint[] = useMemo(() => {
    const land = (landDots ?? []).map((p) => ({
      kind: "land" as const,
      lat: p.lat,
      lng: p.lng,
      size: isMobile ? 0.14 : 0.16,
      color: LAND_DOT,
    }));

    return land;
  }, [isMobile, landDots]);

  const hotspots: Array<EdgeLocation & { tooltip: string; active: boolean; reduced: boolean }> = useMemo(() => {
    const count = isMobile ? 7 : EDGE_GLOBE_LOCATIONS.length;
    return EDGE_GLOBE_LOCATIONS.slice(0, count).map((l) => ({
      ...l,
      tooltip: `${l.provider} \u2022 ${l.city}`,
      active: l.id === activeHotspotId,
      reduced: reducedMotion,
    }));
  }, [activeHotspotId, isMobile, reducedMotion]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    // Controls
    const controls = globe.controls?.();
    if (controls) {
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.autoRotate = active && !reducedMotion;
      controls.autoRotateSpeed = 0.18;
      controls.rotateSpeed = 0.28;
      // Prevent upside-down flips (keep a premium “guided” feel)
      controls.minPolarAngle = Math.PI * 0.22;
      controls.maxPolarAngle = Math.PI * 0.82;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
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
      mat.color = new THREE.Color("#04050A");
      mat.emissive = new THREE.Color("#0A0B14");
      mat.emissiveIntensity = 0.85;
      mat.shininess = 0.35;
      mat.needsUpdate = true;
    }

    // Initial framing (slight tilt, Framer-like)
    const initialAlt = isMobile ? 2.25 : 2.05;
    globe.pointOfView?.({ lat: 18, lng: -30, altitude: initialAlt }, reducedMotion ? 0 : 900);
  }, [active, isMobile, reducedMotion]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    // Pause expensive render loop when offscreen, if supported by the underlying lib.
    if (!active && typeof globe.pauseAnimation === "function") globe.pauseAnimation();
    if (active && typeof globe.resumeAnimation === "function") globe.resumeAnimation();
  }, [active]);

  const focusHotspot = useCallback(
    (loc: EdgeLocation) => {
      setActiveHotspotId(loc.id);
      const globe = globeRef.current;
      if (!globe?.pointOfView) return;
      const alt = isMobile ? 1.95 : 1.65;
      globe.pointOfView({ lat: clamp(loc.lat, -75, 75), lng: loc.lng, altitude: alt }, reducedMotion ? 0 : 900);
    },
    [isMobile, reducedMotion]
  );

  const stars = useMemo(() => {
    // Lightweight starfield: deterministic positions so it doesn’t “jump”.
    const count = isMobile ? 22 : 34;
    const items: Array<{ x: number; y: number; s: number; o: number }> = [];
    for (let i = 0; i < count; i++) {
      const t = i + 1;
      const x = (Math.sin(t * 12.9898) * 43758.5453) % 1;
      const y = (Math.sin(t * 78.233) * 12345.6789) % 1;
      const s = 1 + ((Math.abs(Math.sin(t * 3.13)) * 100) % 2); // 1–3px
      const o = 0.10 + ((Math.abs(Math.sin(t * 9.21)) * 100) % 10) / 100; // 0.10–0.20
      items.push({ x: Math.abs(x) * 100, y: Math.abs(y) * 100, s, o });
    }
    return items;
  }, [isMobile]);

  useEffect(() => {
    if (readyFiredRef.current) return;
    if (!globeRef.current) return;
    if (!landDots) return;
    readyFiredRef.current = true;
    onReady?.();
  }, [landDots, onReady]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${styles.container}`}
    >
      {/* Starfield (subtle, behind everything) */}
      <div className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
        {stars.map((s, idx) => (
          <span
            key={idx}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.s}px`,
              height: `${s.s}px`,
              opacity: s.o,
              filter: "blur(0.2px)",
            }}
          />
        ))}
      </div>

      {/* Rim + glow overlays (gives immediate “sphere read”) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 55%, rgba(123,124,255,0.22) 0%, rgba(123,124,255,0.08) 28%, rgba(0,0,0,0) 60%)",
        }}
      />
      {/* NOTE: Removed container rim/outline overlay (it created an outer “ring” around the sphere). */}

      {/* Absolute stage keeps layout stable while allowing square canvas inside a fixed wrapper. */}
      <div className={styles.stage} style={{ width: size.w, height: size.h }}>
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          rendererConfig={{ antialias: true, alpha: true }}
          globeImageUrl={BLACK_TEXTURE_1PX}
          bumpImageUrl={BLACK_TEXTURE_1PX}
          // Disable Globe's atmosphere layer to remove the “bubble” outline.
          showAtmosphere={false}
          // Dotted continents (land only)
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={0.008}
          pointColor={(d: any) => d.color}
          pointRadius={(d: any) => d.size}
          // Interactive hotspots
          htmlElementsData={hotspots as any}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.012}
          htmlElement={(d: any) => {
            const loc = d as EdgeLocation & { tooltip: string; active: boolean; reduced: boolean };
            const el = document.createElement("div");
            el.className = styles.hotspot;
            el.setAttribute("data-active", loc.active ? "true" : "false");
            el.setAttribute("data-reduced", loc.reduced ? "true" : "false");
            el.setAttribute("role", "button");
            el.setAttribute("tabindex", "0");
            el.setAttribute("aria-label", loc.tooltip);

            const pulse = document.createElement("div");
            pulse.className = styles.pulse;

            const core = document.createElement("div");
            core.className = styles.core;

            const tip = document.createElement("div");
            tip.className = styles.tooltip;
            tip.innerHTML = `<span class="${styles.tooltipDot}"></span>${loc.tooltip}`;

            el.appendChild(pulse);
            el.appendChild(core);
            el.appendChild(tip);

            const onClick = () => focusHotspot(loc);
            const onKeyDown = (e: KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                focusHotspot(loc);
              }
            };
            el.addEventListener("click", onClick);
            el.addEventListener("keydown", onKeyDown as any);

            return el;
          }}
          // Keep UX tight
          animateIn={true}
        />
      </div>
    </div>
  );
}


