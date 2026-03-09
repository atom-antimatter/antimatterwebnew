"use client";
/**
 * VectorBasemap — renders crisp vector tiles via MapLibre GL as a canvas
 * positioned ON TOP of the Cesium canvas with pointer-events: none.
 *
 * When active, MapLibre provides the full basemap (roads, water, labels,
 * borders) rendered with SDF text at native device pixel ratio. Cesium's
 * raster imagery is removed and only its data overlays (DC markers, power
 * layers, fiber routes) remain — those are rendered as HTML tooltips or
 * Cesium entities that the user interacts with through the MapLibre layer
 * via pointer-events: none passthrough.
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
 * Convert Cesium camera height (metres) to MapLibre zoom level.
 *
 * Standard Web Mercator: at zoom z, ground resolution at equator =
 * 78271.484 / 2^z metres/pixel. For a 512px viewport:
 * height ≈ groundRes * 512 / 2 = 78271.484 * 256 / 2^z
 * → z = log2(78271.484 * 256 / height)
 */
function heightToMapLibreZoom(heightM: number): number {
  const z = Math.log2((78271.484 * 256) / Math.max(heightM, 1));
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

    // If style changed, destroy old map
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
      console.log("[VectorBasemap] MapLibre loaded:", styleId);
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

  // Camera sync: Cesium → MapLibre (every frame)
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

      const zoom = heightToMapLibreZoom(height);
      const bearing = -heading;

      map.jumpTo({ center: [lng, lat], zoom, bearing });
    } catch {
      // Camera not ready yet
    }
  }, [viewerRef]);

  // Sync loop — runs at display refresh rate when visible
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
