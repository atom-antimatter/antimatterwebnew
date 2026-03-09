"use client";
/**
 * CityMap — MapLibre GL JS map for LOCAL/CITY zoom levels.
 *
 * Uses OpenFreeMap vector basemap for crisp GPU-rendered labels and linework.
 * Shares the same AtlasMapRef imperative API and prop shape as AtlasMap so
 * DataCenterMapClient can swap between them seamlessly.
 */

import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { DATA_CENTERS, type DataCenter } from "@/data/dataCenters";
import { heightToMapLibreZoom, mapLibreZoomToHeight, TRANSITION_HEIGHT } from "@/lib/map/cameraSync";

let maplibregl: typeof import("maplibre-gl") | null = null;

export type CityMapRef = {
  flyTo: (pos: { lat: number; lng: number; height?: number }, dur?: number) => void;
  resetView: () => void;
  getCameraCenter: () => { lat: number; lng: number } | null;
  getHeight: () => number;
};

type CityMapProps = {
  selectedId?: string | null;
  onSelectDc?: (dc: DataCenter | null) => void;
  highlightIds?: string[] | null;
  onMapClick?: (lat: number, lng: number) => void;
  onZoomOut?: () => void;
  initialCenter: { lat: number; lng: number };
  initialZoom: number;
  visible: boolean;
};

const DC_SOURCE = "dc-points";
const DC_LAYER_CIRCLE = "dc-circles";
const DC_LAYER_CLUSTER = "dc-clusters";
const DC_LAYER_COUNT = "dc-cluster-count";

const STYLE_DARK = "https://tiles.openfreemap.org/styles/positron";

function dcToGeoJSON(dcs: readonly DataCenter[], highlightIds: string[] | null): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: dcs.map(dc => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [dc.lng, dc.lat] },
      properties: {
        id: dc.id,
        name: dc.name,
        tier: dc.tier ?? "core",
        highlighted: !highlightIds || highlightIds.includes(dc.id),
      },
    })),
  };
}

const CityMap = forwardRef<CityMapRef, CityMapProps>(
  ({ selectedId, onSelectDc, highlightIds, onMapClick, onZoomOut, initialCenter, initialZoom, visible }, ref) => {

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<InstanceType<typeof import("maplibre-gl").Map> | null>(null);
  const [ready, setReady] = useState(false);

  useImperativeHandle(ref, () => ({
    flyTo: (pos, dur = 1.5) => {
      const m = mapRef.current;
      if (!m) return;
      const zoom = pos.height ? heightToMapLibreZoom(pos.height, m.getCanvas().clientWidth) : m.getZoom();
      m.flyTo({ center: [pos.lng, pos.lat], zoom, duration: dur * 1000 });
    },
    resetView: () => {
      const m = mapRef.current;
      if (!m) return;
      m.flyTo({ center: [-20, 25], zoom: 2, duration: 2000 });
    },
    getCameraCenter: () => {
      const m = mapRef.current;
      if (!m) return null;
      const c = m.getCenter();
      return { lat: c.lat, lng: c.lng };
    },
    getHeight: () => {
      const m = mapRef.current;
      if (!m) return TRANSITION_HEIGHT;
      return mapLibreZoomToHeight(m.getZoom(), m.getCanvas().clientWidth);
    },
  }), []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      if (!maplibregl) {
        const mod = await import("maplibre-gl");
        maplibregl = mod.default ?? mod;
      }
      if (cancelled || !containerRef.current) return;

      const map = new maplibregl!.Map({
        container: containerRef.current,
        style: STYLE_DARK,
        center: [initialCenter.lng, initialCenter.lat],
        zoom: initialZoom,
        minZoom: 2,
        maxZoom: 20,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on("load", () => {
        if (cancelled) return;

        map.addSource(DC_SOURCE, {
          type: "geojson",
          data: dcToGeoJSON(DATA_CENTERS, highlightIds ?? null),
          cluster: true,
          clusterMaxZoom: 12,
          clusterRadius: 50,
        });

        map.addLayer({
          id: DC_LAYER_CLUSTER,
          type: "circle",
          source: DC_SOURCE,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#696aac",
            "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 50, 30],
            "circle-opacity": 0.85,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "rgba(255,255,255,0.2)",
          },
        });

        map.addLayer({
          id: DC_LAYER_COUNT,
          type: "symbol",
          source: DC_SOURCE,
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["Open Sans Bold"],
            "text-size": 12,
          },
          paint: { "text-color": "#ffffff" },
        });

        map.addLayer({
          id: DC_LAYER_CIRCLE,
          type: "circle",
          source: DC_SOURCE,
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "case",
              ["==", ["get", "tier"], "hyperscale"], "#8587e3",
              ["==", ["get", "tier"], "core"], "#a2a3e9",
              ["==", ["get", "tier"], "enterprise"], "#c7c8f2",
              ["==", ["get", "tier"], "edge"], "#696aac",
              "#a2a3e9",
            ],
            "circle-radius": [
              "case",
              ["==", ["get", "tier"], "hyperscale"], 8,
              ["==", ["get", "tier"], "core"], 6,
              5,
            ],
            "circle-opacity": [
              "case",
              ["get", "highlighted"], 0.95,
              0.25,
            ],
            "circle-stroke-width": 1,
            "circle-stroke-color": "rgba(0,0,0,0.3)",
          },
        });

        setReady(true);
      });

      map.on("click", DC_LAYER_CIRCLE, (e) => {
        const feat = e.features?.[0];
        if (!feat) return;
        const dcId = feat.properties?.id;
        const dc = DATA_CENTERS.find(d => d.id === dcId);
        if (dc) onSelectDc?.(dc);
      });

      map.on("click", DC_LAYER_CLUSTER, (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [DC_LAYER_CLUSTER] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource(DC_SOURCE);
        if (clusterId != null && source && "getClusterExpansionZoom" in source) {
          (source as any).getClusterExpansionZoom(clusterId, (err: Error | null, zoom: number) => {
            if (err) return;
            map.easeTo({ center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number], zoom, duration: 600 });
          });
        }
      });

      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [DC_LAYER_CIRCLE, DC_LAYER_CLUSTER] });
        if (features.length === 0) {
          onSelectDc?.(null);
          onMapClick?.(e.lngLat.lat, e.lngLat.lng);
        }
      });

      map.on("zoomend", () => {
        const h = mapLibreZoomToHeight(map.getZoom(), map.getCanvas().clientWidth);
        if (h > TRANSITION_HEIGHT && onZoomOut) {
          onZoomOut();
        }
      });

      map.on("mouseenter", DC_LAYER_CIRCLE, () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", DC_LAYER_CIRCLE, () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", DC_LAYER_CLUSTER, () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", DC_LAYER_CLUSTER, () => { map.getCanvas().style.cursor = ""; });
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateMarkers = useCallback(() => {
    const m = mapRef.current;
    if (!m || !ready) return;
    const source = m.getSource(DC_SOURCE);
    if (source && "setData" in source) {
      (source as any).setData(dcToGeoJSON(DATA_CENTERS, highlightIds ?? null));
    }
  }, [highlightIds, ready]);

  useEffect(() => { updateMarkers(); }, [updateMarkers]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m || !ready) return;
    if (visible) {
      m.resize();
      m.triggerRepaint();
    }
  }, [visible, ready]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ visibility: visible ? "visible" : "hidden" }}
    />
  );
});

CityMap.displayName = "CityMap";
export default CityMap;
