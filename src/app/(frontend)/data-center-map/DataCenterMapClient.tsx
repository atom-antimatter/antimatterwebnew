"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CommandPanel, { type SearchStatus } from "@/components/dataCenterGlobe/CommandPanel";
import DetailCard from "@/components/dataCenterGlobe/DetailCard";
import LayersMenu, { type LayersState, type PowerScenario } from "@/components/atlas/LayersMenu";
import type { AtlasMapRef, Basemap } from "@/components/atlas/AtlasMap.client";
import { DATA_CENTERS, type DataCenter } from "@/data/dataCenters";
import { filterDataCenters } from "@/lib/search/filterDataCenters";
import { runSearchPipeline } from "@/lib/search/searchPipeline";
import type { GazetteerResult } from "@/lib/search/gazetteer";

// AtlasMap must be loaded client-side only (Cesium cannot run in Node).
// The inner component uses forwardRef, so we use the `.default` shape.
const AtlasMap = dynamic(
  () => import("@/components/atlas/AtlasMap.client"),
  { ssr: false, loading: () => null }
);

// ─── types ────────────────────────────────────────────────────────────────────

type GeocodedPos = { lat: number; lng: number } | null;

// ─── defaults ─────────────────────────────────────────────────────────────────

// SiteBrief loads client-only (uses fetch hooks)
const SiteBrief = dynamic(
  () => import("@/components/atlas/power/SiteBrief"),
  { ssr: false, loading: () => null }
);

const DEFAULT_LAYERS: LayersState = {
  countryBorders: true,
  stateBorders: false,
  cities: true,
  points: true,
  routes: true,
  // Power layers — off by default to keep initial load clean
  powerHeatmap: false,
  powerGeneration: false,
  powerCarbon: false,
  powerQueue: false,
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
  // Power & Energy
  const [powerScenario, setPowerScenario] = useState<PowerScenario>({ targetMw: 100, radiusKm: 80 });
  const [siteBriefPos, setSiteBriefPos] = useState<{ lat: number; lng: number } | null>(null);

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

  const handleSearch = useCallback(
    async (query: string) => {
      setLastRawQuery(query);
      setGeocodedPos(null);
      setSearchStatus("loading");

      // Run 3-stage pipeline: local gazetteer → NLP (parallel) → geocode fallback
      const pipelineResult = await runSearchPipeline(query, {
        useNLP: true,
        defaultRadiusKm: radiusKm,
      });

      // Merge pipeline filters with active UI filters
      const mergedCaps = Array.from(new Set([
        ...capabilityFilters,
        ...pipelineResult.filters.capabilities,
      ]));
      const mergedTier = (pipelineResult.filters.tier ?? tierFilter) as DataCenter["tier"] | null;
      const mergedRadius = pipelineResult.filters.radiusKm ?? radiusKm;

      // If pipeline extracted a provider, update capabilityFilters state accordingly (optional)
      if (pipelineResult.filters.provider) {
        // Provider is handled via text search — no separate state needed yet
      }

      const pos = pipelineResult.location
        ? { lat: pipelineResult.location.lat, lng: pipelineResult.location.lng }
        : null;

      if (pos) {
        setGeocodedPos(pos);
        const bbox = pipelineResult.location?.bbox;
        if (bbox) {
          // Fly to bounding box centre
          const [west, south, east, north] = bbox;
          atlasRef.current?.flyTo({
            lat: (south + north) / 2,
            lng: (west + east) / 2,
            height: FLY_HEIGHT_SEARCH,
          }, 1.5);
        } else {
          atlasRef.current?.flyTo({ lat: pos.lat, lng: pos.lng, height: FLY_HEIGHT_SEARCH }, 1.5);
        }
      }

      // If pipeline selected a facility directly, select it
      if (pipelineResult.location?.kind === "facility" && pipelineResult.location.dc) {
        handleSelectDc(pipelineResult.location.dc);
        setSearchStatus("idle");
        return;
      }

      const filtered = filterDataCenters(DATA_CENTERS, {
        geocodedPos: pos ?? undefined,
        radiusKm: mergedRadius,
        capabilities: mergedCaps,
        tier: mergedTier,
        textQuery: pos ? undefined : query,
      });

      setResults(filtered);
      setSearchStatus(filtered.length === 0 ? (pos ? "no-dc" : "geocode-none") : "idle");
      if (!pos && filtered.length > 0) {
        atlasRef.current?.flyTo({ lat: filtered[0].lat, lng: filtered[0].lng, height: FLY_HEIGHT_SEARCH }, 1.5);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [capabilityFilters, tierFilter, radiusKm]
  );

  const handleFilterChange = useCallback(
    (newCaps: string[], newTier: string | null, newRadius: number) => {
      if (!lastRawQuery && !geocodedPos) return;
      const filtered = filterDataCenters(DATA_CENTERS, {
        geocodedPos: geocodedPos ?? undefined,
        radiusKm: newRadius,
        capabilities: newCaps,
        tier: newTier as DataCenter["tier"] | null,
        textQuery: geocodedPos ? undefined : lastRawQuery,
      });
      setResults(filtered);
      setSearchStatus(filtered.length === 0 ? (geocodedPos ? "no-dc" : "geocode-none") : "idle");
    },
    [lastRawQuery, geocodedPos]
  );

  /** Called when user picks a gazetteer city suggestion (not a facility) */
  const handleSelectSuggestion = useCallback((r: GazetteerResult) => {
    const pos = { lat: r.lat, lng: r.lng };
    setGeocodedPos(pos);
    atlasRef.current?.flyTo({ lat: r.lat, lng: r.lng, height: FLY_HEIGHT_SEARCH }, 1.2);
    const filtered = filterDataCenters(DATA_CENTERS, {
      geocodedPos: pos,
      radiusKm,
      capabilities: capabilityFilters,
      tier: tierFilter as DataCenter["tier"] | null,
    });
    setResults(filtered);
    setSearchStatus(filtered.length === 0 ? "no-dc" : "idle");
  }, [radiusKm, capabilityFilters, tierFilter]);

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
    // overscroll-none prevents elastic bounce / page scroll while interacting with the map
    <div className="h-[100dvh] w-full bg-[#020202] overflow-hidden overscroll-none relative">
      {/* Back button — top-right, clear of the command panel */}
      <Link
        href="/"
        className="
          fixed top-4 left-4 z-50 flex items-center gap-2
          px-3 py-2 rounded-xl text-sm font-medium
          bg-[rgba(6,7,15,0.82)] backdrop-blur-md
          border border-[rgba(246,246,253,0.12)]
          text-[rgba(246,246,253,0.75)] hover:text-[#f6f6fd] hover:border-[rgba(246,246,253,0.25)]
          transition-colors shadow-lg
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#696aac]
        "
        aria-label="Back to Antimatter AI"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Antimatter AI</span>
      </Link>

      {/* Cesium map fills the full viewport */}
      <AtlasMap
        ref={atlasRef}
        selectedId={selectedDc?.id ?? null}
        onSelectDc={handleSelectDc}
        highlightIds={highlightIds}
        layers={layers}
        basemap={basemap}
        powerScenario={powerScenario}
        onMapClick={(lat, lng) => {
          // Open Site Brief when power layer is active and user clicks the map
          if (layers.powerHeatmap || layers.powerGeneration || layers.powerCarbon || layers.powerQueue) {
            setSiteBriefPos({ lat, lng });
          }
        }}
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
        onSelectSuggestion={handleSelectSuggestion}
      />

      {/* Right detail card (DC selection) */}
      {selectedDc && !siteBriefPos && (
        <DetailCard dc={selectedDc} onClose={() => setSelectedDc(null)} />
      )}

      {/* Site Brief (power feasibility for clicked location) */}
      {siteBriefPos && (
        <SiteBrief
          lat={siteBriefPos.lat}
          lng={siteBriefPos.lng}
          targetMw={powerScenario.targetMw}
          radiusKm={powerScenario.radiusKm}
          onClose={() => setSiteBriefPos(null)}
        />
      )}

      {/* Layers menu — bottom right */}
      <LayersMenu
        layers={layers}
        onChange={setLayers}
        basemap={basemap}
        onBasemapChange={setBasemap}
        onResetView={() => atlasRef.current?.resetView()}
        powerScenario={powerScenario}
        onPowerScenarioChange={setPowerScenario}
      />
    </div>
  );
}
