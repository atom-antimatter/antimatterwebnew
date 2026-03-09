"use client";

/**
 * DataCenterMapClient — orchestrates the Infrastructure Atlas.
 *
 * Pure Cesium renderer. Layer state is owned by atlasLayersStore (Zustand).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CommandPanel, { type SearchStatus } from "@/components/dataCenterGlobe/CommandPanel";
import DetailCard from "@/components/dataCenterGlobe/DetailCard";
import LayersMenu from "@/components/atlas/LayersMenu";
import type { AtlasMapRef, AtlasLayers } from "@/components/atlas/AtlasMap.client";
import PowerFeasibilityPanel from "@/components/atlas/power/PowerFeasibilityPanel";
import { DATA_CENTERS, type DataCenter } from "@/data/dataCenters";
import { filterDataCenters } from "@/lib/search/filterDataCenters";
import { runSearchPipeline } from "@/lib/search/searchPipeline";
import type { GazetteerResult } from "@/lib/search/gazetteer";
import { useAtlasLayersStore } from "@/state/atlasLayersStore";
import { useAtlasSelectionStore } from "@/state/atlasSelectionStore";
import { useModalStore } from "@/state/modalStore";
import { useEscapeToCloseModal } from "@/hooks/useEscapeToCloseModal";
import { use3DAvailability } from "@/hooks/use3DAvailability";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import ThreeDEntryButton from "@/components/atlas/ThreeDEntryButton";
import ThreeDExitButton from "@/components/atlas/ThreeDExitButton";

const LinodeCard = dynamic(() => import("@/components/atlas/providers/LinodeCard"), { ssr: false, loading: () => null });
const AtlasMap   = dynamic(() => import("@/components/atlas/AtlasMap.client"),       { ssr: false, loading: () => null });
const SiteBrief  = dynamic(() => import("@/components/atlas/power/SiteBrief"),       { ssr: false, loading: () => null });

// ─── constants ────────────────────────────────────────────────────────────────

type GeocodedPos = { lat: number; lng: number } | null;
type TierFilter = NonNullable<DataCenter["tier"]> | null;

// Deliberate camera heights — land in crisp zoom bands, not arbitrary altitudes.
const PREFERRED_HEIGHT_DC     =  120_000; // 120 km — CITY band, crisp Cesium labels
const PREFERRED_HEIGHT_SEARCH =  800_000; // 800 km — LOCAL band, readable
const PREFERRED_HEIGHT_RESET  = 18_000_000; // world view

// ─── component ────────────────────────────────────────────────────────────────

/** Breakpoint below which we show the mobile fallback (no Cesium) to avoid crashes. */
const ATLAS_MOBILE_BREAKPOINT = 768;

export default function DataCenterMapClient() {
  const atlasRef = useRef<AtlasMapRef | null>(null);
  const isMobile = useIsMobile(ATLAS_MOBILE_BREAKPOINT);

  const { activeModal, openModal, closeModal } = useModalStore();
  useEscapeToCloseModal();

  // ── Layer state from store (single source of truth) ────────────────────
  const { overlays, power, providers, basemap, powerScenario } = useAtlasLayersStore();

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

  // ── Selection store ─────────────────────────────────────────────────────
  const {
    selectedDc, setSelectedDc,
    selectedLinode, setSelectedLinode,
    pinnedPoint, setPinnedPoint,
    setFilterDebug,
    is3DActive, enter3D, exit3D,
  } = useAtlasSelectionStore();

  // ── UI state ────────────────────────────────────────────────────────────
  const [isPanelOpen,  setIsPanelOpen]  = useState(true);
  const [siteBriefPos, setSiteBriefPos] = useState<{ lat: number; lng: number } | null>(null);

  // ── 3D availability ──────────────────────────────────────────────────────
  // Poll camera state from the ref every 500ms to drive the 3D availability hook.
  const [polledCameraState, setPolledCameraState] = useState<{ height: number; level: string; viewRect: { west: number; south: number; east: number; north: number } | null }>({
    height: 18_000_000, level: "WORLD", viewRect: null,
  });

  useEffect(() => {
    const id = setInterval(() => {
      const ref = atlasRef.current;
      if (!ref) return;
      const height = ref.getCameraHeight();
      const viewRect = ref.getViewRect();
      const level = height > 10_000_000 ? "WORLD" : height > 3_500_000 ? "REGION" : height > 900_000 ? "LOCAL" : "CITY";
      setPolledCameraState(prev => {
        if (prev.height === height && prev.viewRect?.west === viewRect?.west) return prev;
        return { height, level, viewRect };
      });
    }, 500);
    return () => clearInterval(id);
  }, []);

  const threeDAvail = use3DAvailability(
    polledCameraState as any,
    !is3DActive,
  );

  const handleEnter3D = useCallback(() => {
    const ref = atlasRef.current;
    if (!ref) return;
    const center = ref.getCameraCenter();
    const height = ref.getCameraHeight();
    if (center) {
      // Store pre-3D state for exit restoration
      enter3D({ lat: center.lat, lng: center.lng, height });
      // Atomic: fly + enable lighting + load buildings (all inside the map ref)
      ref.enter3DMode(
        threeDAvail.centerLat || center.lat,
        threeDAvail.centerLng || center.lng,
      );
    }
  }, [enter3D, threeDAvail.centerLat, threeDAvail.centerLng]);

  const handleExit3D = useCallback(() => {
    const pre = useAtlasSelectionStore.getState().pre3DCameraState;
    // Atomic: revert lighting + disable buildings
    atlasRef.current?.exit3DMode();
    exit3D();
    // Fly back to pre-3D camera position
    if (pre && atlasRef.current) {
      atlasRef.current.flyTo({ lat: pre.lat, lng: pre.lng, height: pre.height }, 1.5);
    }
  }, [exit3D]);

  // ── Search state ────────────────────────────────────────────────────────
  const [results,          setResults]          = useState<DataCenter[] | null>(null);
  const [searchStatus,     setSearchStatus]     = useState<SearchStatus>("idle");
  const [capabilityFilters,setCapabilityFilters]= useState<string[]>([]);
  const [tierFilter,       setTierFilter]       = useState<TierFilter>(null);
  const [radiusKm,         setRadiusKm]         = useState(500);
  const [geocodedPos,      setGeocodedPos]      = useState<GeocodedPos>(null);
  const [lastRawQuery,     setLastRawQuery]     = useState("");

  const highlightIds = results && results.length > 0 ? results.map(d => d.id) : null;

  // ── DC selection — always flies to a deliberate crisp height ───────────
  const handleSelectDc = useCallback((dc: DataCenter | null) => {
    setSelectedDc(dc);
    if (dc) {
      setSelectedLinode(null);
      openModal("datacenter");
      atlasRef.current?.flyTo({ lat: dc.lat, lng: dc.lng, height: PREFERRED_HEIGHT_DC }, 1.2);
    } else {
      if (activeModal === "datacenter") closeModal();
    }
  }, [setSelectedDc, setSelectedLinode, openModal, closeModal, activeModal]);

  /**
   * Unified filter pipeline. Three modes:
   *  1. Search/geocode: geocodedPos exists → radius + capability/tier
   *  2. Text: rawQuery but no geocodedPos → fuzzy match + filters
   *  3. Browse: no query → filter all DCs immediately
   */
  const computeVisibleResults = useCallback(
    (opts: { rawQuery: string; pos: GeocodedPos; caps: string[]; tier: TierFilter; radius: number }) => {
      const { rawQuery, pos, caps, tier, radius } = opts;
      const hasFilters = caps.length > 0 || tier !== null;
      const hasQuery = !!rawQuery;

      const mode = pos ? "geocode" as const
        : hasQuery ? "text" as const
        : hasFilters ? "browse" as const
        : "idle" as const;

      if (mode === "idle") {
        setResults(null);
        setSearchStatus("idle");
        setFilterDebug({ rawQuery, geocodedPos: pos, capabilities: caps, tier, resultCount: 0, mode });
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
      setFilterDebug({ rawQuery, geocodedPos: pos, capabilities: caps, tier, resultCount: filtered.length, mode });

      if (filtered.length === 0) {
        if (pos) setSearchStatus("no-dc");
        else if (hasQuery) setSearchStatus("no-results");
        else setSearchStatus("no-filter-match");
      } else {
        setSearchStatus("idle");
      }
    },
    [setFilterDebug]
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
        atlasRef.current?.flyTo({ lat: (s+n)/2, lng: (w+e)/2, height: PREFERRED_HEIGHT_SEARCH }, 1.5);
      } else {
        atlasRef.current?.flyTo({ lat: pos.lat, lng: pos.lng, height: PREFERRED_HEIGHT_SEARCH }, 1.5);
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
    if (!pos && filtered.length > 0) {
      atlasRef.current?.flyTo({ lat: filtered[0].lat, lng: filtered[0].lng, height: PREFERRED_HEIGHT_SEARCH }, 1.5);
    }
  }, [capabilityFilters, tierFilter, radiusKm, handleSelectDc]);

  const handleSelectSuggestion = useCallback((r: GazetteerResult) => {
    if (r.kind === "facility" && r.dc) {
      handleSelectDc(r.dc);
      setResults([r.dc]);
      setSearchStatus("idle");
      return;
    }
    const pos = { lat: r.lat, lng: r.lng };
    setGeocodedPos(pos);
    atlasRef.current?.flyTo({ lat: r.lat, lng: r.lng, height: PREFERRED_HEIGHT_SEARCH }, 1.2);
    computeVisibleResults({ rawQuery: lastRawQuery, pos, caps: capabilityFilters, tier: tierFilter, radius: radiusKm });
  }, [radiusKm, capabilityFilters, tierFilter, lastRawQuery, handleSelectDc, computeVisibleResults]);

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

  // ── Render ────────────────────────────────────────────────────────────────

  // Mobile: do not load Cesium (causes "a problem repeatedly occurred" crash on many devices)
  if (isMobile) {
    return (
      <div className="h-[100dvh] w-full bg-[#020202] overflow-hidden overscroll-none relative flex flex-col items-center justify-center p-6">
        <Link
          href="/"
          className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-[rgba(6,7,15,0.82)] backdrop-blur-md border border-[rgba(246,246,253,0.12)] text-[rgba(246,246,253,0.75)] hover:text-[#f6f6fd] hover:border-[rgba(246,246,253,0.25)] transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#696aac]"
          aria-label="Back to Antimatter AI"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Antimatter AI</span>
        </Link>
        <div className="text-center max-w-sm">
          <h1 className="text-lg font-semibold text-[#f6f6fd] mb-2">Infrastructure Atlas</h1>
          <p className="text-sm text-[rgba(246,246,253,0.6)] leading-relaxed">
            For the best experience, open the atlas on a desktop or tablet. Mobile support is coming soon.
          </p>
        </div>
      </div>
    );
  }

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

      {/* Cesium map — full-screen, no opacity wrapper */}
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
          if (r) { setSelectedDc(null); setSiteBriefPos(null); setPinnedPoint(null); openModal("linode"); }
        }}
        selectedLinodeId={selectedLinode?.region_id ?? null}
        is3DActive={is3DActive}
        onMapClick={(lat, lng) => {
          setPinnedPoint({ lat, lng });
          openModal("power");
          setSelectedDc(null);
          setSelectedLinode(null);
          setSiteBriefPos(null);
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

      <PowerFeasibilityPanel
        selectedDc={selectedDc}
        pinnedPoint={pinnedPoint}
        onPinCenter={() => {
          const centre = atlasRef.current?.getCameraCenter?.();
          if (centre) {
            setPinnedPoint(centre);
            openModal("power");
          }
        }}
        onClearPin={() => setPinnedPoint(null)}
      />

      {selectedDc && activeModal === "datacenter" && !siteBriefPos && (
        <DetailCard dc={selectedDc} onClose={() => { setSelectedDc(null); closeModal(); }} />
      )}
      {selectedLinode && activeModal === "linode" && !siteBriefPos && (
        <LinodeCard region={selectedLinode} onClose={() => { setSelectedLinode(null); closeModal(); }} />
      )}
      {siteBriefPos && (
        <SiteBrief lat={siteBriefPos.lat} lng={siteBriefPos.lng} targetMw={powerScenario.targetMw} radiusKm={powerScenario.radiusKm} onClose={() => setSiteBriefPos(null)} />
      )}

      {/* 3D entry / exit */}
      <ThreeDEntryButton
        visible={threeDAvail.is3DAvailable && !is3DActive}
        buildingCount={threeDAvail.buildingCount}
        onClick={handleEnter3D}
      />
      <ThreeDExitButton visible={is3DActive} onClick={handleExit3D} />

      {/* Layers menu — reads/writes store directly */}
      <LayersMenu onResetView={() => atlasRef.current?.flyTo({ lat: 25, lng: -20, height: PREFERRED_HEIGHT_RESET }, 2)} />
    </div>
  );
}
