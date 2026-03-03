"use client";

import { useCallback, useRef, useState } from "react";
import GlobeView, { type GlobeViewRef } from "@/components/dataCenterGlobe/GlobeView";
import CommandPanel, { type SearchStatus } from "@/components/dataCenterGlobe/CommandPanel";
import DetailCard from "@/components/dataCenterGlobe/DetailCard";
import LayersToggle, { type LayersState } from "@/components/dataCenterGlobe/LayersToggle";
import { DATA_CENTERS, type DataCenter } from "@/data/dataCenters";
import { parseSearchQuery } from "@/lib/search/parseSearchQuery";
import { filterDataCenters } from "@/lib/search/filterDataCenters";

type GeocodedPos = { lat: number; lng: number } | null;

type GeocodeResult = { lat: number; lng: number; displayName: string };

// ─── default layer state ──────────────────────────────────────────────────────

const DEFAULT_LAYERS: LayersState = {
  countryBorders: true,
  stateBorders: false,
  points: true,
  routes: true,
};

// ─── component ────────────────────────────────────────────────────────────────

export default function DataCenterMapClient() {
  const globeRef = useRef<GlobeViewRef | null>(null);

  // UI state
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedDc, setSelectedDc] = useState<DataCenter | null>(null);
  const [layers, setLayers] = useState<LayersState>(DEFAULT_LAYERS);

  // Search state
  const [results, setResults] = useState<DataCenter[] | null>(null);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [capabilityFilters, setCapabilityFilters] = useState<string[]>([]);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(500);
  const [geocodedPos, setGeocodedPos] = useState<GeocodedPos>(null);
  const [lastRawQuery, setLastRawQuery] = useState("");

  // IDs to highlight when results are active
  const highlightIds =
    results && results.length > 0 ? results.map((d) => d.id) : null;

  // ─── search handler ────────────────────────────────────────────────────────

  const runSearch = useCallback(
    async (opts: {
      rawQuery: string;
      capabilities: string[];
      tier: string | null;
      radius: number;
      pos?: GeocodedPos;
    }) => {
      const { rawQuery, capabilities, tier, radius, pos } = opts;

      // Parse natural-language query into structured tokens
      const parsed = parseSearchQuery(rawQuery);

      // Merge capability tokens from NL parse with active UI filters
      const mergedCaps = Array.from(new Set([...parsed.capabilities, ...capabilities]));
      const mergedTier = (parsed.tier ?? tier) as DataCenter["tier"] | null;

      // Geocode if we have a place query and no already-known position
      let resolvedPos = pos ?? null;

      if (!resolvedPos && parsed.placeQuery) {
        setSearchStatus("loading");
        try {
          const res = await fetch(`/api/geocode?q=${encodeURIComponent(parsed.placeQuery)}`);
          if (res.ok) {
            const data = await res.json();
            const list = data.results as GeocodeResult[] | undefined;
            if (Array.isArray(list) && list.length > 0) {
              resolvedPos = { lat: list[0].lat, lng: list[0].lng };
              setGeocodedPos(resolvedPos);
              // Fly globe to geocoded location
              globeRef.current?.pointOfView(
                { lat: list[0].lat, lng: list[0].lng, altitude: 1.6 },
                900
              );
            }
          }
        } catch {
          // Geocode failed — fall through to text search
        }
      }

      // Run filter
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
          ? resolvedPos
            ? "no-dc"
            : "geocode-none"
          : "idle"
      );

      // If text-only and found results, fly to first match
      if (!resolvedPos && filtered.length > 0) {
        const dc = filtered[0];
        globeRef.current?.pointOfView({ lat: dc.lat, lng: dc.lng, altitude: 1.8 }, 900);
      }
    },
    []
  );

  const handleSearch = useCallback(
    async (query: string) => {
      setLastRawQuery(query);
      setGeocodedPos(null); // reset geocoded pos on new search
      await runSearch({
        rawQuery: query,
        capabilities: capabilityFilters,
        tier: tierFilter,
        radius: radiusKm,
      });
    },
    [capabilityFilters, tierFilter, radiusKm, runSearch]
  );

  // Re-run filter when capability/tier/radius change (using last geocoded pos if available)
  const handleFilterChange = useCallback(
    (newCaps: string[], newTier: string | null, newRadius: number) => {
      if (!lastRawQuery && !geocodedPos) return; // nothing to re-filter
      runSearch({
        rawQuery: lastRawQuery,
        capabilities: newCaps,
        tier: newTier,
        radius: newRadius,
        pos: geocodedPos,
      });
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

  // ─── DC selection ──────────────────────────────────────────────────────────

  const handleSelectDc = useCallback((dc: DataCenter | null) => {
    setSelectedDc(dc);
    if (dc) {
      globeRef.current?.pointOfView({ lat: dc.lat, lng: dc.lng, altitude: 1.5 }, 900);
    }
  }, []);

  // ─── reset ─────────────────────────────────────────────────────────────────

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

  // ─── render ────────────────────────────────────────────────────────────────

  return (
    // Full-screen container; globe sits behind fixed nav (z-50)
    <div className="h-[100dvh] w-full bg-[#020202] overflow-hidden relative">
      {/* Globe fills full screen */}
      <GlobeView
        active={true}
        globeRef={globeRef}
        selectedId={selectedDc?.id ?? null}
        onSelectDc={handleSelectDc}
        highlightIds={highlightIds}
        showCountryBorders={layers.countryBorders}
        showStateBorders={layers.stateBorders}
        showRoutes={layers.routes}
        showPoints={layers.points}
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
        <DetailCard
          dc={selectedDc}
          onClose={() => setSelectedDc(null)}
        />
      )}

      {/* Layers toggle — bottom-right */}
      <LayersToggle layers={layers} onChange={setLayers} />
    </div>
  );
}
