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
import type { CityMapRef } from "@/components/atlas/CityMap.client";
import PowerFeasibilityPanel from "@/components/atlas/power/PowerFeasibilityPanel";
import { DATA_CENTERS, type DataCenter } from "@/data/dataCenters";
import { filterDataCenters } from "@/lib/search/filterDataCenters";
import { runSearchPipeline } from "@/lib/search/searchPipeline";
import type { GazetteerResult } from "@/lib/search/gazetteer";
import { heightToMapLibreZoom, TRANSITION_HEIGHT } from "@/lib/map/cameraSync";
import { useAtlasLayersStore } from "@/state/atlasLayersStore";
import { useAtlasSelectionStore } from "@/state/atlasSelectionStore";

const LinodeCard = dynamic(() => import("@/components/atlas/providers/LinodeCard"), { ssr: false, loading: () => null });
const AtlasMap   = dynamic(() => import("@/components/atlas/AtlasMap.client"),       { ssr: false, loading: () => null });
const CityMap    = dynamic(() => import("@/components/atlas/CityMap.client"),        { ssr: false, loading: () => null });
const SiteBrief  = dynamic(() => import("@/components/atlas/power/SiteBrief"),       { ssr: false, loading: () => null });

// ─── constants ────────────────────────────────────────────────────────────────

type GeocodedPos = { lat: number; lng: number } | null;
type TierFilter = NonNullable<DataCenter["tier"]> | null;

const FLY_HEIGHT_SEARCH = 1_800_000;
const FLY_HEIGHT_DC     =   800_000;

// ─── component ────────────────────────────────────────────────────────────────

export default function DataCenterMapClient() {
  const atlasRef = useRef<AtlasMapRef | null>(null);
  const cityRef  = useRef<CityMapRef | null>(null);

  type MapMode = "globe" | "city";
  const [mapMode, setMapMode] = useState<MapMode>("globe");
  const [cityCenter, setCityCenter] = useState<{ lat: number; lng: number }>({ lat: 33.75, lng: -84.39 });
  const [cityZoom, setCityZoom]     = useState(8);

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
    powerQueue:      power.powerQueue,
    linodeRegions:   providers.linodeRegions,
  };

  // ── Selection store (replaces local DC/Linode/pin state) ───────────────
  const {
    selectedDc, setSelectedDc,
    selectedLinode, setSelectedLinode,
    pinnedPoint, setPinnedPoint,
    powerPanelOpen, setPowerPanelOpen,
  } = useAtlasSelectionStore();

  // ── UI state (not persisted) ────────────────────────────────────────────
  const [isPanelOpen,  setIsPanelOpen]  = useState(true);
  const [siteBriefPos, setSiteBriefPos] = useState<{ lat: number; lng: number } | null>(null);

  // ── Search state ────────────────────────────────────────────────────────
  const [results,          setResults]          = useState<DataCenter[] | null>(null);
  const [searchStatus,     setSearchStatus]     = useState<SearchStatus>("idle");
  const [capabilityFilters,setCapabilityFilters]= useState<string[]>([]);
  const [tierFilter,       setTierFilter]       = useState<TierFilter>(null);
  const [radiusKm,         setRadiusKm]         = useState(500);
  const [geocodedPos,      setGeocodedPos]      = useState<GeocodedPos>(null);
  const [lastRawQuery,     setLastRawQuery]     = useState("");

  const highlightIds = results && results.length > 0 ? results.map(d => d.id) : null;

  const handleSelectDc = useCallback((dc: DataCenter | null) => {
    setSelectedDc(dc);
    if (dc) {
      setSelectedLinode(null);
      flyToAny({ lat: dc.lat, lng: dc.lng, height: FLY_HEIGHT_DC }, 1.2);
    }
  }, [setSelectedDc, setSelectedLinode, flyToAny]);

  /**
   * Unified filter pipeline. Supports three modes:
   *  1. Search mode: geocodedPos exists -> radius + capability/tier
   *  2. Text mode: rawQuery exists, no geocodedPos -> text match + filters
   *  3. Browse mode: no query -> filter all DCs by capability/tier
   */
  const computeVisibleResults = useCallback(
    (opts: { rawQuery: string; pos: GeocodedPos; caps: string[]; tier: TierFilter; radius: number }) => {
      const { rawQuery, pos, caps, tier, radius } = opts;
      const hasFilters = caps.length > 0 || tier !== null;
      const hasQuery = !!rawQuery;

      if (!pos && !hasQuery && !hasFilters) {
        setResults(null);
        setSearchStatus("idle");
        return;
      }

      const filtered = filterDataCenters(DATA_CENTERS, {
        geocodedPos: pos ?? undefined,
        radiusKm: radius,
        capabilities: caps,
        tier,
        textQuery: pos ? undefined : rawQuery || undefined,
      });
      setResults(filtered);

      if (filtered.length === 0) {
        if (pos) setSearchStatus("no-dc");
        else if (hasQuery) setSearchStatus("no-results");
        else setSearchStatus("no-results");
      } else {
        setSearchStatus("idle");
      }
    },
    []
  );

  const handleFilterChange = useCallback(
    (newCaps: string[], newTier: TierFilter, newRadius: number) => {
      computeVisibleResults({ rawQuery: lastRawQuery, pos: geocodedPos, caps: newCaps, tier: newTier, radius: newRadius });
    },
    [lastRawQuery, geocodedPos, computeVisibleResults]
  );

  const handleSearch = useCallback(async (query: string) => {
    setLastRawQuery(query);
    setGeocodedPos(null);
    setSearchStatus("loading");

    const pipelineResult = await runSearchPipeline(query, { useNLP: true, defaultRadiusKm: radiusKm });

    const mergedCaps   = Array.from(new Set([...capabilityFilters, ...pipelineResult.filters.capabilities]));
    const mergedTier: TierFilter = pipelineResult.filters.tier ?? tierFilter ?? null;
    const mergedRadius = pipelineResult.filters.radiusKm ?? radiusKm;
    setCapabilityFilters(mergedCaps);
    setTierFilter(mergedTier);
    setRadiusKm(mergedRadius);

    const pos = pipelineResult.location ? { lat: pipelineResult.location.lat, lng: pipelineResult.location.lng } : null;
    if (pos) {
      setGeocodedPos(pos);
      const bbox = pipelineResult.location?.bbox;
      if (bbox) {
        const [w, s, e, n] = bbox;
        flyToAny({ lat: (s+n)/2, lng: (w+e)/2, height: FLY_HEIGHT_SEARCH }, 1.5);
      } else {
        flyToAny({ lat: pos.lat, lng: pos.lng, height: FLY_HEIGHT_SEARCH }, 1.5);
      }
    }
    if (pipelineResult.location?.kind === "facility" && pipelineResult.location.dc) {
      const dc = pipelineResult.location.dc;
      handleSelectDc(dc);
      setResults([dc]);
      setSearchStatus("idle");
      return;
    }
    const filtered = filterDataCenters(DATA_CENTERS, {
      geocodedPos: pos ?? undefined, radiusKm: mergedRadius,
      capabilities: mergedCaps, tier: mergedTier, textQuery: pos ? undefined : query,
    });
    setResults(filtered);
    setSearchStatus(filtered.length === 0 ? (pos ? "no-dc" : "no-results") : "idle");
    if (!pos && filtered.length > 0) flyToAny({ lat: filtered[0].lat, lng: filtered[0].lng, height: FLY_HEIGHT_SEARCH }, 1.5);
  }, [capabilityFilters, tierFilter, radiusKm, handleSelectDc, flyToAny]);

  const handleSelectSuggestion = useCallback((r: GazetteerResult) => {
    if (r.kind === "facility" && r.dc) {
      handleSelectDc(r.dc);
      setResults([r.dc]);
      setSearchStatus("idle");
      return;
    }
    const pos = { lat: r.lat, lng: r.lng };
    setGeocodedPos(pos);
    flyToAny({ lat: r.lat, lng: r.lng, height: FLY_HEIGHT_SEARCH }, 1.2);
    computeVisibleResults({ rawQuery: lastRawQuery, pos, caps: capabilityFilters, tier: tierFilter, radius: radiusKm });
  }, [radiusKm, capabilityFilters, tierFilter, lastRawQuery, handleSelectDc, computeVisibleResults, flyToAny]);

  const handleToggleCapability = useCallback((cap: string) => {
    const next = capabilityFilters.includes(cap) ? capabilityFilters.filter(c => c !== cap) : [...capabilityFilters, cap];
    setCapabilityFilters(next);
    handleFilterChange(next, tierFilter, radiusKm);
  }, [capabilityFilters, tierFilter, radiusKm, handleFilterChange]);

  const handleSetTier = useCallback((tier: TierFilter) => {
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
  }, [setSelectedDc]);

  const flyToAny = useCallback((pos: { lat: number; lng: number; height?: number }, dur = 1.5) => {
    const h = pos.height ?? FLY_HEIGHT_SEARCH;
    if (h < TRANSITION_HEIGHT && mapMode === "globe") {
      const center = atlasRef.current?.getCameraCenter() ?? { lat: pos.lat, lng: pos.lng };
      setCityCenter(center);
      setCityZoom(heightToMapLibreZoom(h));
      setMapMode("city");
      setTimeout(() => cityRef.current?.flyTo(pos, dur), 150);
    } else if (h >= TRANSITION_HEIGHT && mapMode === "city") {
      setMapMode("globe");
      setTimeout(() => atlasRef.current?.flyTo(pos, dur), 150);
    } else if (mapMode === "city") {
      cityRef.current?.flyTo(pos, dur);
    } else {
      atlasRef.current?.flyTo(pos, dur);
    }
  }, [mapMode]);

  const handleTransitionToCity = useCallback(() => {
    const center = atlasRef.current?.getCameraCenter();
    if (center) {
      setCityCenter(center);
      setCityZoom(heightToMapLibreZoom(TRANSITION_HEIGHT * 0.8));
      setMapMode("city");
    }
  }, []);

  const handleTransitionToGlobe = useCallback(() => {
    const center = cityRef.current?.getCameraCenter();
    if (center) {
      setMapMode("globe");
      setTimeout(() => {
        atlasRef.current?.flyTo({ lat: center.lat, lng: center.lng, height: TRANSITION_HEIGHT * 1.2 }, 1.0);
      }, 100);
    }
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

      {/* Globe mode (Cesium) */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: mapMode === "globe" ? 1 : 0, pointerEvents: mapMode === "globe" ? "auto" : "none" }}
      >
        <AtlasMap
          ref={atlasRef}
          selectedId={selectedDc?.id ?? null}
          onSelectDc={dc => { handleSelectDc(dc); if (dc) setSelectedLinode(null); }}
          highlightIds={highlightIds}
          layers={layers}
          basemap={basemap}
          powerScenario={powerScenario}
          onSelectLinode={r => {
            setSelectedLinode(r);
            if (r) { setSelectedDc(null); setSiteBriefPos(null); setPinnedPoint(null); }
          }}
          selectedLinodeId={selectedLinode?.region_id ?? null}
          onMapClick={(lat, lng) => {
            setPinnedPoint({ lat, lng });
            setPowerPanelOpen(true);
            setSelectedDc(null);
            setSelectedLinode(null);
            setSiteBriefPos(null);
          }}
        />
      </div>

      {/* City mode (MapLibre vector tiles) */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: mapMode === "city" ? 1 : 0, pointerEvents: mapMode === "city" ? "auto" : "none" }}
      >
        <CityMap
          ref={cityRef}
          selectedId={selectedDc?.id ?? null}
          onSelectDc={dc => { handleSelectDc(dc); if (dc) setSelectedLinode(null); }}
          highlightIds={highlightIds}
          onMapClick={(lat, lng) => {
            setPinnedPoint({ lat, lng });
            setPowerPanelOpen(true);
            setSelectedDc(null);
            setSelectedLinode(null);
            setSiteBriefPos(null);
          }}
          onZoomOut={handleTransitionToGlobe}
          initialCenter={cityCenter}
          initialZoom={cityZoom}
          visible={mapMode === "city"}
        />
      </div>

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

      <PowerFeasibilityPanel
        isOpen={powerPanelOpen}
        onOpen={() => setPowerPanelOpen(true)}
        onClose={() => setPowerPanelOpen(false)}
        selectedDc={selectedDc}
        pinnedPoint={pinnedPoint}
        onPinCenter={() => {
          const centre = mapMode === "city"
            ? cityRef.current?.getCameraCenter?.()
            : atlasRef.current?.getCameraCenter?.();
          if (centre) {
            setPinnedPoint(centre);
            setPowerPanelOpen(true);
          }
        }}
        onClearPin={() => setPinnedPoint(null)}
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
      <LayersMenu onResetView={() => {
        setMapMode("globe");
        setTimeout(() => atlasRef.current?.resetView(), 100);
      }} />
    </div>
  );
}
