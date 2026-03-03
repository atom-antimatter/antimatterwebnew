"use client";

/**
 * DataCenterMapClient — orchestrates the Infrastructure Atlas.
 *
 * Layer state is now owned by atlasLayersStore (Zustand).
 * This component no longer has local useState for layers/basemap/powerScenario.
 */

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CommandPanel, { type SearchStatus } from "@/components/dataCenterGlobe/CommandPanel";
import DetailCard from "@/components/dataCenterGlobe/DetailCard";
import LayersMenu from "@/components/atlas/LayersMenu";
import type { AtlasMapRef, AtlasLayers } from "@/components/atlas/AtlasMap.client";
import { DATA_CENTERS, type DataCenter } from "@/data/dataCenters";
import { filterDataCenters } from "@/lib/search/filterDataCenters";
import { runSearchPipeline } from "@/lib/search/searchPipeline";
import type { GazetteerResult } from "@/lib/search/gazetteer";
import type { ProviderRegion } from "@/lib/providers/linode/types";
import { useAtlasLayersStore } from "@/state/atlasLayersStore";

const LinodeCard = dynamic(() => import("@/components/atlas/providers/LinodeCard"), { ssr: false, loading: () => null });
const AtlasMap   = dynamic(() => import("@/components/atlas/AtlasMap.client"),       { ssr: false, loading: () => null });
const SiteBrief  = dynamic(() => import("@/components/atlas/power/SiteBrief"),       { ssr: false, loading: () => null });

// ─── constants ────────────────────────────────────────────────────────────────

type GeocodedPos = { lat: number; lng: number } | null;

const FLY_HEIGHT_SEARCH = 1_800_000;
const FLY_HEIGHT_DC     =   800_000;

// ─── component ────────────────────────────────────────────────────────────────

export default function DataCenterMapClient() {
  const atlasRef = useRef<AtlasMapRef | null>(null);

  // ── Layer state from store (single source of truth) ────────────────────
  const { overlays, power, providers, basemap, powerScenario } = useAtlasLayersStore();

  // Flatten into the shape AtlasMap expects
  const layers: AtlasLayers = {
    countryBorders:  overlays.countryBorders,
    stateBorders:    overlays.stateBorders,
    cities:          overlays.cities,
    points:          overlays.points,
    routes:          overlays.routes,
    powerHeatmap:    power.powerHeatmap,
    powerGeneration: power.powerGeneration,
    powerCarbon:     power.powerCarbon,
    powerQueue:      power.powerQueue,
    linodeRegions:   providers.linodeRegions,
  };

  // ── UI state (not persisted) ────────────────────────────────────────────
  const [isPanelOpen,  setIsPanelOpen]  = useState(true);
  const [selectedDc,   setSelectedDc]   = useState<DataCenter | null>(null);
  const [selectedLinode, setSelectedLinode] = useState<ProviderRegion | null>(null);
  const [siteBriefPos, setSiteBriefPos] = useState<{ lat: number; lng: number } | null>(null);

  // ── Search state ────────────────────────────────────────────────────────
  const [results,          setResults]          = useState<DataCenter[] | null>(null);
  const [searchStatus,     setSearchStatus]     = useState<SearchStatus>("idle");
  const [capabilityFilters,setCapabilityFilters]= useState<string[]>([]);
  const [tierFilter,       setTierFilter]       = useState<string | null>(null);
  const [radiusKm,         setRadiusKm]         = useState(500);
  const [geocodedPos,      setGeocodedPos]      = useState<GeocodedPos>(null);
  const [lastRawQuery,     setLastRawQuery]     = useState("");

  const highlightIds = results && results.length > 0 ? results.map(d => d.id) : null;

  const handleSelectDc = useCallback((dc: DataCenter | null) => {
    setSelectedDc(dc);
    if (dc) atlasRef.current?.flyTo({ lat: dc.lat, lng: dc.lng, height: FLY_HEIGHT_DC }, 1.2);
  }, []);

  const handleFilterChange = useCallback(
    (newCaps: string[], newTier: string | null, newRadius: number) => {
      if (!lastRawQuery && !geocodedPos) return;
      const filtered = filterDataCenters(DATA_CENTERS, {
        geocodedPos: geocodedPos ?? undefined, radiusKm: newRadius,
        capabilities: newCaps, tier: newTier as DataCenter["tier"] | null,
        textQuery: geocodedPos ? undefined : lastRawQuery,
      });
      setResults(filtered);
      setSearchStatus(filtered.length === 0 ? (geocodedPos ? "no-dc" : "geocode-none") : "idle");
    },
    [lastRawQuery, geocodedPos]
  );

  const handleSearch = useCallback(async (query: string) => {
    setLastRawQuery(query);
    setGeocodedPos(null);
    setSearchStatus("loading");

    const pipelineResult = await runSearchPipeline(query, { useNLP: true, defaultRadiusKm: radiusKm });

    const mergedCaps   = Array.from(new Set([...capabilityFilters, ...pipelineResult.filters.capabilities]));
    const mergedTier   = (pipelineResult.filters.tier ?? tierFilter) as DataCenter["tier"] | null;
    const mergedRadius = pipelineResult.filters.radiusKm ?? radiusKm;

    const pos = pipelineResult.location ? { lat: pipelineResult.location.lat, lng: pipelineResult.location.lng } : null;
    if (pos) {
      setGeocodedPos(pos);
      const bbox = pipelineResult.location?.bbox;
      if (bbox) {
        const [w, s, e, n] = bbox;
        atlasRef.current?.flyTo({ lat: (s+n)/2, lng: (w+e)/2, height: FLY_HEIGHT_SEARCH }, 1.5);
      } else {
        atlasRef.current?.flyTo({ lat: pos.lat, lng: pos.lng, height: FLY_HEIGHT_SEARCH }, 1.5);
      }
    }
    if (pipelineResult.location?.kind === "facility" && pipelineResult.location.dc) {
      handleSelectDc(pipelineResult.location.dc);
      setSearchStatus("idle");
      return;
    }
    const filtered = filterDataCenters(DATA_CENTERS, {
      geocodedPos: pos ?? undefined, radiusKm: mergedRadius,
      capabilities: mergedCaps, tier: mergedTier, textQuery: pos ? undefined : query,
    });
    setResults(filtered);
    setSearchStatus(filtered.length === 0 ? (pos ? "no-dc" : "geocode-none") : "idle");
    if (!pos && filtered.length > 0) atlasRef.current?.flyTo({ lat: filtered[0].lat, lng: filtered[0].lng, height: FLY_HEIGHT_SEARCH }, 1.5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capabilityFilters, tierFilter, radiusKm]);

  const handleSelectSuggestion = useCallback((r: GazetteerResult) => {
    const pos = { lat: r.lat, lng: r.lng };
    setGeocodedPos(pos);
    atlasRef.current?.flyTo({ lat: r.lat, lng: r.lng, height: FLY_HEIGHT_SEARCH }, 1.2);
    const filtered = filterDataCenters(DATA_CENTERS, { geocodedPos: pos, radiusKm, capabilities: capabilityFilters, tier: tierFilter as DataCenter["tier"] | null });
    setResults(filtered);
    setSearchStatus(filtered.length === 0 ? "no-dc" : "idle");
  }, [radiusKm, capabilityFilters, tierFilter]);

  const handleToggleCapability = useCallback((cap: string) => {
    const next = capabilityFilters.includes(cap) ? capabilityFilters.filter(c => c !== cap) : [...capabilityFilters, cap];
    setCapabilityFilters(next);
    handleFilterChange(next, tierFilter, radiusKm);
  }, [capabilityFilters, tierFilter, radiusKm, handleFilterChange]);

  const handleSetTier = useCallback((tier: string | null) => {
    setTierFilter(tier);
    handleFilterChange(capabilityFilters, tier, radiusKm);
  }, [capabilityFilters, radiusKm, handleFilterChange]);

  const handleSetRadius = useCallback((km: number) => {
    setRadiusKm(km);
    handleFilterChange(capabilityFilters, tierFilter, km);
  }, [capabilityFilters, tierFilter, handleFilterChange]);

  const handleReset = useCallback(() => {
    setResults(null); setSearchStatus("idle");
    setCapabilityFilters([]); setTierFilter(null);
    setRadiusKm(500); setGeocodedPos(null);
    setLastRawQuery(""); setSelectedDc(null);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-[100dvh] w-full bg-[#020202] overflow-hidden overscroll-none relative">
      {/* Back button */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-[rgba(6,7,15,0.82)] backdrop-blur-md border border-[rgba(246,246,253,0.12)] text-[rgba(246,246,253,0.75)] hover:text-[#f6f6fd] hover:border-[rgba(246,246,253,0.25)] transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#696aac]"
        aria-label="Back to Antimatter AI"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Antimatter AI</span>
      </Link>

      {/* Cesium map — reads layers from store via flat prop */}
      <AtlasMap
        ref={atlasRef}
        selectedId={selectedDc?.id ?? null}
        onSelectDc={dc => { handleSelectDc(dc); if (dc) setSelectedLinode(null); }}
        highlightIds={highlightIds}
        layers={layers}
        basemap={basemap}
        powerScenario={powerScenario}
        onSelectLinode={r => { setSelectedLinode(r); if (r) { setSelectedDc(null); setSiteBriefPos(null); } }}
        selectedLinodeId={selectedLinode?.region_id ?? null}
        onMapClick={(lat, lng) => {
          // Always allow power assessment from any map click — no power-layer gate
          setSiteBriefPos({ lat, lng });
          setSelectedLinode(null);
          setSelectedDc(null);
        }}
      />

      {/* Left search / filter panel */}
      <CommandPanel
        isOpen={isPanelOpen}
        onToggle={() => setIsPanelOpen(o => !o)}
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

      {selectedDc && !siteBriefPos && !selectedLinode && (
        <DetailCard dc={selectedDc} onClose={() => setSelectedDc(null)} />
      )}
      {selectedLinode && !siteBriefPos && (
        <LinodeCard region={selectedLinode} onClose={() => setSelectedLinode(null)} />
      )}
      {siteBriefPos && (
        <SiteBrief lat={siteBriefPos.lat} lng={siteBriefPos.lng} targetMw={powerScenario.targetMw} radiusKm={powerScenario.radiusKm} onClose={() => setSiteBriefPos(null)} />
      )}

      {/* Layers menu — reads/writes store directly */}
      <LayersMenu onResetView={() => atlasRef.current?.resetView()} />
    </div>
  );
}
