"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import CommandPanel, { type SearchStatus } from "@/components/dataCenterGlobe/CommandPanel";
import DetailCard from "@/components/dataCenterGlobe/DetailCard";
import LayersMenu, { type LayersState } from "@/components/atlas/LayersMenu";
import type { AtlasMapRef, Basemap } from "@/components/atlas/AtlasMap.client";
import { DATA_CENTERS, type DataCenter } from "@/data/dataCenters";
import { parseSearchQuery } from "@/lib/search/parseSearchQuery";
import { filterDataCenters } from "@/lib/search/filterDataCenters";
import { findCityByName } from "@/components/atlas/cities/cityIndex";

// AtlasMap must be loaded client-side only (Cesium cannot run in Node).
// The inner component uses forwardRef, so we use the `.default` shape.
const AtlasMap = dynamic(
  () => import("@/components/atlas/AtlasMap.client"),
  { ssr: false, loading: () => null }
);

// ─── types ────────────────────────────────────────────────────────────────────

type GeocodedPos = { lat: number; lng: number } | null;
type GeocodeApiResult = { lat: number; lng: number; displayName: string };

// ─── defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_LAYERS: LayersState = {
  countryBorders: true,
  stateBorders: false,
  cities: true,
  points: true,
  routes: true,
};

// Height in metres for flyTo calls at each zoom context
const FLY_HEIGHT_SEARCH = 1_800_000;  // after search → show a region
const FLY_HEIGHT_DC = 800_000;        // when selecting a single DC

// ─── component ────────────────────────────────────────────────────────────────

export default function DataCenterMapClient() {
  const atlasRef = useRef<AtlasMapRef | null>(null);

  // UI state
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedDc, setSelectedDc] = useState<DataCenter | null>(null);
  const [layers, setLayers] = useState<LayersState>(DEFAULT_LAYERS);
  const [basemap, setBasemap] = useState<Basemap>("osmDark");

  // Search state
  const [results, setResults] = useState<DataCenter[] | null>(null);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [capabilityFilters, setCapabilityFilters] = useState<string[]>([]);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(500);
  const [geocodedPos, setGeocodedPos] = useState<GeocodedPos>(null);
  const [lastRawQuery, setLastRawQuery] = useState("");

  const highlightIds =
    results && results.length > 0 ? results.map((d) => d.id) : null;

  // ─── search ───────────────────────────────────────────────────────────────

  const runSearch = useCallback(
    async (opts: {
      rawQuery: string;
      capabilities: string[];
      tier: string | null;
      radius: number;
      pos?: GeocodedPos;
    }) => {
      const { rawQuery, capabilities, tier, radius, pos } = opts;
      const parsed = parseSearchQuery(rawQuery);
      const mergedCaps = Array.from(new Set([...parsed.capabilities, ...capabilities]));
      const mergedTier = (parsed.tier ?? tier) as DataCenter["tier"] | null;

      let resolvedPos = pos ?? null;

      if (!resolvedPos && parsed.placeQuery) {
        setSearchStatus("loading");

        // 1. Fast local city lookup first
        const local = findCityByName(parsed.placeQuery);
        if (local) {
          resolvedPos = { lat: local.lat, lng: local.lng };
        } else {
          // 2. Fall back to Nominatim geocode API
          try {
            const res = await fetch(
              `/api/geocode?q=${encodeURIComponent(parsed.placeQuery)}`
            );
            if (res.ok) {
              const data = await res.json();
              const list = data.results as GeocodeApiResult[] | undefined;
              if (Array.isArray(list) && list.length > 0) {
                resolvedPos = { lat: list[0].lat, lng: list[0].lng };
              }
            }
          } catch {
            // geocode failure — fall through to text search
          }
        }

        if (resolvedPos) {
          setGeocodedPos(resolvedPos);
          atlasRef.current?.flyTo(
            { lat: resolvedPos.lat, lng: resolvedPos.lng, height: FLY_HEIGHT_SEARCH },
            1.5
          );
        }
      }

      const filtered = filterDataCenters(DATA_CENTERS, {
        geocodedPos: resolvedPos,
        radiusKm: radius,
        capabilities: mergedCaps,
        tier: mergedTier,
        textQuery: resolvedPos ? undefined : rawQuery,
      });

      setResults(filtered);
      setSearchStatus(
        filtered.length === 0
          ? resolvedPos ? "no-dc" : "geocode-none"
          : "idle"
      );

      // Text-only: fly to first match
      if (!resolvedPos && filtered.length > 0) {
        const dc = filtered[0];
        atlasRef.current?.flyTo({ lat: dc.lat, lng: dc.lng, height: FLY_HEIGHT_SEARCH }, 1.5);
      }
    },
    []
  );

  const handleSearch = useCallback(
    async (query: string) => {
      setLastRawQuery(query);
      setGeocodedPos(null);
      await runSearch({ rawQuery: query, capabilities: capabilityFilters, tier: tierFilter, radius: radiusKm });
    },
    [capabilityFilters, tierFilter, radiusKm, runSearch]
  );

  const handleFilterChange = useCallback(
    (newCaps: string[], newTier: string | null, newRadius: number) => {
      if (!lastRawQuery && !geocodedPos) return;
      runSearch({ rawQuery: lastRawQuery, capabilities: newCaps, tier: newTier, radius: newRadius, pos: geocodedPos });
    },
    [lastRawQuery, geocodedPos, runSearch]
  );

  const handleToggleCapability = useCallback(
    (cap: string) => {
      const next = capabilityFilters.includes(cap)
        ? capabilityFilters.filter((c) => c !== cap)
        : [...capabilityFilters, cap];
      setCapabilityFilters(next);
      handleFilterChange(next, tierFilter, radiusKm);
    },
    [capabilityFilters, tierFilter, radiusKm, handleFilterChange]
  );

  const handleSetTier = useCallback(
    (tier: string | null) => {
      setTierFilter(tier);
      handleFilterChange(capabilityFilters, tier, radiusKm);
    },
    [capabilityFilters, radiusKm, handleFilterChange]
  );

  const handleSetRadius = useCallback(
    (km: number) => {
      setRadiusKm(km);
      handleFilterChange(capabilityFilters, tierFilter, km);
    },
    [capabilityFilters, tierFilter, handleFilterChange]
  );

  // ─── DC selection ─────────────────────────────────────────────────────────

  const handleSelectDc = useCallback((dc: DataCenter | null) => {
    setSelectedDc(dc);
    if (dc) {
      atlasRef.current?.flyTo({ lat: dc.lat, lng: dc.lng, height: FLY_HEIGHT_DC }, 1.2);
    }
  }, []);

  // ─── reset ────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setResults(null);
    setSearchStatus("idle");
    setCapabilityFilters([]);
    setTierFilter(null);
    setRadiusKm(500);
    setGeocodedPos(null);
    setLastRawQuery("");
    setSelectedDc(null);
  }, []);

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <div className="h-[100dvh] w-full bg-[#020202] overflow-hidden relative">
      {/* Cesium map fills the full viewport */}
      <AtlasMap
        ref={atlasRef}
        selectedId={selectedDc?.id ?? null}
        onSelectDc={handleSelectDc}
        highlightIds={highlightIds}
        layers={layers}
        basemap={basemap}
      />

      {/* Left command panel */}
      <CommandPanel
        isOpen={isPanelOpen}
        onToggle={() => setIsPanelOpen((o) => !o)}
        onSearch={handleSearch}
        onSelectDc={handleSelectDc}
        selectedId={selectedDc?.id ?? null}
        results={results}
        searchStatus={searchStatus}
        capabilityFilters={capabilityFilters}
        onToggleCapability={handleToggleCapability}
        tierFilter={tierFilter}
        onSetTier={handleSetTier}
        radiusKm={radiusKm}
        onSetRadius={handleSetRadius}
        showRadius={geocodedPos !== null}
        onReset={handleReset}
      />

      {/* Right detail card */}
      {selectedDc && (
        <DetailCard dc={selectedDc} onClose={() => setSelectedDc(null)} />
      )}

      {/* Layers menu — bottom right */}
      <LayersMenu
        layers={layers}
        onChange={setLayers}
        basemap={basemap}
        onBasemapChange={setBasemap}
        onResetView={() => atlasRef.current?.resetView()}
      />
    </div>
  );
}
