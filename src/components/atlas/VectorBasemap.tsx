"use client";
/**
 * VectorBasemap — renders crisp vector tiles via MapLibre GL as a canvas
 * positioned BEHIND the Cesium canvas. Camera is synced from Cesium → MapLibre
 * on every frame.
 *
 * Architecture:
 *  - MapLibre renders labels, roads, borders with SDF text (retina-native)
 *  - Cesium renders markers, overlays, 3D buildings on top
 *  - Cesium's globe base color is set to transparent so MapLibre shows through
 *  - pointer-events: none on MapLibre so all interaction goes to Cesium
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

/** Convert Cesium camera height (metres) to approximate MapLibre zoom level. */
function heightToMapLibreZoom(heightM: number): number {
  // At zoom 0, one pixel ≈ 156543m. zoom = log2(156543 / metersPerPixel)
  // metersPerPixel ≈ heightM / (canvasHeight/2)
  // Simplified: zoom ≈ log2(156543 * 512 / heightM) - 1
  const z = Math.log2((156543 * 512) / Math.max(heightM, 1)) - 1;
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
    if (mapRef.current) return; // already initialized with this style

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [0, 0],
      zoom: 2,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
      maxPitch: 0,
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

  // Camera sync: Cesium → MapLibre
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
      // MapLibre bearing is negative of Cesium heading
      const bearing = -heading;

      map.jumpTo({
        center: [lng, lat],
        zoom,
        bearing,
      });
    } catch {
      // Camera not ready yet
    }
  }, [viewerRef]);

  // Start camera sync loop when visible
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
        zIndex: 0,
        pointerEvents: "none",
        visibility: visible ? "visible" : "hidden",
      }}
    />
  );
}
