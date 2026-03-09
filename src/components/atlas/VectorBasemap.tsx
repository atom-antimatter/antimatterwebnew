"use client";
/**
 * VectorBasemap — renders crisp vector tiles via MapLibre GL as a canvas
 * behind the Cesium canvas (which has alpha: true for transparency).
 *
 * When active, Cesium's globe is hidden and its canvas becomes transparent.
 * MapLibre provides the full basemap (roads, water, labels, borders) rendered
 * with SDF text at native device pixel ratio. Cesium entities (DC markers,
 * fiber routes, overlays) render on the transparent canvas above MapLibre.
 */
import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import type { VectorStyleId } from "@/lib/map/vectorBasemap";
import { VECTOR_STYLE_URLS } from "@/lib/map/vectorBasemap";

type Props = {
  styleId: VectorStyleId;
  viewerRef: React.RefObject<unknown>;
  visible: boolean;
};

/**
 * Convert Cesium camera height (metres) to MapLibre zoom level,
 * corrected for latitude (ground resolution varies by cos(lat)).
 *
 * At zoom z, ground resolution = (78271.484 * cos(lat)) / 2^z metres/pixel.
 * For a ~512px viewport: height ~ groundRes * 256
 * => z = log2((78271.484 * cos(lat) * 256) / height)
 */
function heightToMapLibreZoom(heightM: number, latDeg: number): number {
  const latRad = (Math.abs(latDeg) * Math.PI) / 180;
  const cosLat = Math.max(0.01, Math.cos(latRad));
  const z = Math.log2((78271.484 * cosLat * 256) / Math.max(heightM, 1));
  return Math.max(0, Math.min(22, z));
}

export default function VectorBasemap({ styleId, viewerRef, visible }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const syncFrameRef = useRef<number | null>(null);
  const prevStyleRef = useRef<string>("");

  // Initialize MapLibre
  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const styleUrl = VECTOR_STYLE_URLS[styleId];
    if (!styleUrl) return;

    if (mapRef.current && prevStyleRef.current !== styleId) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [0, 0],
      zoom: 2,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
      pixelRatio: window.devicePixelRatio,
      maxPitch: 85,
    });

    map.on("load", () => {
      console.log("[VectorBasemap] MapLibre loaded:", styleId,
        "layers:", map.getStyle()?.layers?.length ?? 0);
    });

    map.on("error", (e) => {
      console.warn("[VectorBasemap] MapLibre error:", e.error?.message ?? e);
    });

    mapRef.current = map;
    prevStyleRef.current = styleId;

    return () => {
      if (syncFrameRef.current !== null) cancelAnimationFrame(syncFrameRef.current);
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleId]);

  // Camera sync: Cesium -> MapLibre (every frame)
  const syncCamera = useCallback(() => {
    const viewer = viewerRef.current as any;
    const map = mapRef.current;
    if (!viewer || !map || viewer.isDestroyed?.()) return;

    try {
      const cam = viewer.camera;
      const carto = cam.positionCartographic;
      if (!carto) return;

      const lat = (carto.latitude * 180) / Math.PI;
      const lng = (carto.longitude * 180) / Math.PI;
      const height = carto.height;
      const heading = (cam.heading * 180) / Math.PI;
      // Cesium pitch: 0 = looking at horizon, -PI/2 = looking straight down
      const cesiumPitchDeg = (cam.pitch * 180) / Math.PI;

      const zoom = heightToMapLibreZoom(height, lat);
      const bearing = -heading;
      // MapLibre pitch: 0 = top-down, 60 = tilted. Cesium pitch: -90 = top-down, 0 = horizon.
      const mapLibrePitch = Math.max(0, Math.min(85, 90 + cesiumPitchDeg));

      map.jumpTo({ center: [lng, lat], zoom, bearing, pitch: mapLibrePitch });
    } catch {
      // Camera not ready yet
    }
  }, [viewerRef]);

  // Sync loop at display refresh rate when visible
  useEffect(() => {
    if (!visible) {
      if (syncFrameRef.current !== null) {
        cancelAnimationFrame(syncFrameRef.current);
        syncFrameRef.current = null;
      }
      return;
    }

    const loop = () => {
      syncCamera();
      syncFrameRef.current = requestAnimationFrame(loop);
    };
    syncFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (syncFrameRef.current !== null) {
        cancelAnimationFrame(syncFrameRef.current);
        syncFrameRef.current = null;
      }
    };
  }, [visible, syncCamera]);

  // Resize MapLibre when container changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const observer = new ResizeObserver(() => map.resize());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [styleId]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{
        zIndex: 1,
        pointerEvents: "none",
        visibility: visible ? "visible" : "hidden",
      }}
    />
  );
}
