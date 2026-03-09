"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X, RotateCcw, MapPin, Building2, Hash } from "lucide-react";
import styles from "@/components/ui/css/Button.module.css";
import type { DataCenter } from "@/data/dataCenters";
import { FEATURED_CAPABILITIES, capabilityShortLabel } from "@/data/capabilityCatalog";
import { searchGazetteer, initGazetteer, type GazetteerResult } from "@/lib/search/gazetteer";

// ─── types ────────────────────────────────────────────────────────────────────

export type SearchStatus = "idle" | "loading" | "no-results" | "no-dc" | "no-filter-match";
type TierFilter = NonNullable<DataCenter["tier"]> | null;

export type CommandPanelProps = {
  isOpen: boolean;
  onToggle: () => void;
  onSearch: (query: string) => void;
  onSelectDc: (dc: DataCenter) => void;
  /** Called when user picks a gazetteer suggestion (city/zip) — bypasses full search */
  onSelectSuggestion?: (r: GazetteerResult) => void;
  selectedId?: string | null;
  results: DataCenter[] | null;
  searchStatus: SearchStatus;
  capabilityFilters: string[];
  onToggleCapability: (cap: string) => void;
  tierFilter: TierFilter;
  onSetTier: (tier: TierFilter) => void;
  radiusKm: number;
  onSetRadius: (km: number) => void;
  showRadius: boolean;
  onReset: () => void;
};

// ─── constants ────────────────────────────────────────────────────────────────

const RADIUS_OPTIONS: { label: string; km: number }[] = [
  { label: "100 km", km: 100 },
  { label: "250 km", km: 250 },
  { label: "500 km", km: 500 },
  { label: "1 000 km", km: 1000 },
  { label: "2 500 km", km: 2500 },
];

const TIER_OPTIONS: { label: string; value: TierFilter }[] = [
  { label: "All tiers", value: null },
  { label: "Hyperscale", value: "hyperscale" },
  { label: "Core", value: "core" },
  { label: "Enterprise", value: "enterprise" },
  { label: "Edge", value: "edge" },
];

const EXAMPLES = ["Atlanta", "30308", "edge + gpu near london", "hyperscale in dallas", "ixp in frankfurt"];

// ─── sub-components ──────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: DataCenter["tier"] }) {
  const classes: Record<string, string> = {
    hyperscale: "bg-[rgba(133,135,227,0.18)] text-[#a2a3e9] border-[rgba(133,135,227,0.3)]",
    core: "bg-[rgba(105,106,172,0.18)] text-[#c7c8f2] border-[rgba(105,106,172,0.3)]",
    enterprise: "bg-[rgba(62,63,126,0.2)] text-[#8587e3] border-[rgba(62,63,126,0.35)]",
    edge: "bg-[rgba(162,163,233,0.12)] text-[#696aac] border-[rgba(162,163,233,0.2)]",
  };
  if (!tier) return null;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded border uppercase tracking-wider ${classes[tier] ?? classes.core}`}
    >
      {tier}
    </span>
  );
}

function ResultRow({
  dc,
  isSelected,
  onClick,
}: {
  dc: DataCenter;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 transition-colors border-l-2 ${
        isSelected
          ? "bg-[rgba(105,106,172,0.18)] border-l-[#696aac]"
          : "border-l-transparent hover:bg-[rgba(246,246,253,0.04)] focus:bg-[rgba(105,106,172,0.1)]"
      } focus:outline-none`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-[#f6f6fd] leading-snug">{dc.name}</span>
        <TierBadge tier={dc.tier} />
      </div>
      <div className="text-xs text-[rgba(246,246,253,0.55)] mb-1.5">
        {[dc.city, dc.stateOrRegion, dc.country].filter(Boolean).join(", ")}
        {dc.provider && (
          <span className="text-[rgba(162,163,233,0.7)] ml-1.5">· {dc.provider}</span>
        )}
      </div>
      {dc.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {dc.capabilities.slice(0, 4).map((cap) => (
            <span
              key={cap}
              className="px-1.5 py-0.5 text-[10px] rounded bg-[rgba(105,106,172,0.15)] text-[#a2a3e9]"
            >
              {capabilityShortLabel(cap)}
            </span>
          ))}
          {dc.capabilities.length > 4 && (
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-[rgba(105,106,172,0.1)] text-[rgba(162,163,233,0.6)]">
              +{dc.capabilities.length - 4}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function CommandPanel({
  isOpen,
  onToggle,
  onSearch,
  onSelectDc,
  onSelectSuggestion,
  selectedId,
  results,
  searchStatus,
  capabilityFilters,
  onToggleCapability,
  tierFilter,
  onSetTier,
  radiusKm,
  onSetRadius,
  showRadius,
  onReset,
}: CommandPanelProps) {
  const [query, setQuery] = useState("");
  const [exampleIdx, setExampleIdx] = useState(0);
  const [suggestions, setSuggestions] = useState<GazetteerResult[]>([]);
  const [activeSuggIdx, setActiveSuggIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const suggRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const PAGE_SIZE = 15;

  // Initialise gazetteer on mount
  useEffect(() => { initGazetteer(); }, []);

  // Reset pagination whenever a new result set arrives
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [results]);

  // Rotate placeholder examples
  useEffect(() => {
    const id = setInterval(() => setExampleIdx((i) => (i + 1) % EXAMPLES.length), 3500);
    return () => clearInterval(id);
  }, []);

  // Debounced typeahead
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setActiveSuggIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const s = searchGazetteer(value, 6);
      setSuggestions(s);
      setShowSuggestions(s.length > 0);
    }, 250);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setShowSuggestions(false);
      const q = query.trim();
      if (q) onSearch(q);
    },
    [query, onSearch]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    onReset();
    inputRef.current?.focus();
  }, [onReset]);

  const handleSelectSugg = useCallback((s: GazetteerResult) => {
    setQuery(s.label);
    setShowSuggestions(false);
    setSuggestions([]);
    if (s.kind === "facility" && s.dc) {
      onSelectDc(s.dc);
    } else {
      onSelectSuggestion?.(s);
    }
  }, [onSelectDc, onSelectSuggestion]);

  // Keyboard nav: up/down for suggestions, then results list
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showSuggestions && suggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveSuggIdx((i) => Math.min(i + 1, suggestions.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveSuggIdx((i) => Math.max(i - 1, -1));
          return;
        }
        if (e.key === "Enter" && activeSuggIdx >= 0) {
          e.preventDefault();
          handleSelectSugg(suggestions[activeSuggIdx]);
          return;
        }
        if (e.key === "Escape") {
          setShowSuggestions(false);
          return;
        }
      }
      if (!showSuggestions && results?.length) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          (resultsRef.current?.querySelector("button") as HTMLButtonElement)?.focus();
        }
      }
    },
    [showSuggestions, suggestions, activeSuggIdx, results, handleSelectSugg]
  );

  const hasFilters =
    capabilityFilters.length > 0 || tierFilter !== null || query.trim() !== "";

  return (
    <>
      {/* Panel */}
      <div
        role="complementary"
        aria-label="Infrastructure search panel"
        onWheel={(e) => e.stopPropagation()}
        className={`
          fixed top-0 left-0 h-full z-40
          w-[340px] xl:w-[380px]
          bg-[rgba(6,7,15,0.88)] backdrop-blur-xl
          border-r border-[rgba(246,246,253,0.07)]
          flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header — sits below nav */}
        <div className="pt-20 px-5 pb-4 border-b border-[rgba(246,246,253,0.07)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[rgba(162,163,233,0.6)] mb-0.5">
                Antimatter AI
              </p>
              <h1 className="text-lg font-semibold text-[#f6f6fd] leading-tight">
                Infrastructure Atlas
              </h1>
            </div>
            {/* Mobile close */}
            <button
              type="button"
              onClick={onToggle}
              aria-label="Close panel"
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-[rgba(246,246,253,0.06)] text-[rgba(246,246,253,0.6)] hover:text-[#f6f6fd] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-[rgba(246,246,253,0.07)]">
          <form onSubmit={handleSubmit} role="search" aria-label="Search data centers">
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-[rgba(105,106,172,0.7)] pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder={`e.g. ${EXAMPLES[exampleIdx]}`}
                  autoComplete="off"
                  aria-label="Search locations and capabilities"
                  aria-autocomplete="list"
                  aria-controls="search-suggestions"
                  className="
                    w-full h-10 pl-8 pr-10 rounded-xl text-sm
                    bg-[rgba(246,246,253,0.05)] border border-[rgba(246,246,253,0.09)]
                    text-[#f6f6fd] placeholder:text-[rgba(246,246,253,0.35)]
                    focus:outline-none focus:border-[#696aac] focus:ring-1 focus:ring-[rgba(105,106,172,0.4)]
                    transition-colors
                  "
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Clear search"
                    className="absolute right-3 text-[rgba(246,246,253,0.4)] hover:text-[rgba(246,246,253,0.8)] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Typeahead suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  id="search-suggestions"
                  ref={suggRef}
                  role="listbox"
                  aria-label="Search suggestions"
                  className="
                    absolute top-full left-0 right-0 mt-1 z-50
                    rounded-xl overflow-hidden
                    bg-[rgba(6,7,15,0.96)] backdrop-blur-xl
                    border border-[rgba(246,246,253,0.1)] shadow-2xl
                  "
                >
                  {suggestions.map((s, i) => {
                    const Icon = s.kind === "zip" ? Hash : s.kind === "facility" ? Building2 : MapPin;
                    const isActive = i === activeSuggIdx;
                    return (
                      <button
                        key={`${s.kind}-${s.lat}-${s.lng}-${i}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onMouseDown={(e) => { e.preventDefault(); handleSelectSugg(s); }}
                        className={`
                          w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors
                          ${isActive ? "bg-[rgba(105,106,172,0.2)]" : "hover:bg-[rgba(246,246,253,0.04)]"}
                        `}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[rgba(162,163,233,0.6)]" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[#f6f6fd] leading-snug truncate">{s.label}</div>
                          {s.sublabel && (
                            <div className="text-[10px] text-[rgba(246,246,253,0.45)] mt-0.5 truncate">{s.sublabel}</div>
                          )}
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-[rgba(105,106,172,0.6)] shrink-0 mt-0.5">
                          {s.kind}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              type="submit"
              className={`${styles.button} mt-2 w-full text-sm text-[#f6f6fd]`}
              style={{ padding: "8px 0" }}
            >
              {searchStatus === "loading" ? "Searching…" : "Search"}
            </button>
          </form>
        </div>

        {/* Filters — collapsible so results have room */}
        <div className="border-b border-[rgba(246,246,253,0.07)]">
          {/* Collapse toggle row */}
          <button
            type="button"
            onClick={() => setFiltersCollapsed((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/[0.02] transition-colors focus:outline-none"
            aria-expanded={!filtersCollapsed}
          >
            <span className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.4)]">
              Filters
            </span>
            <span className="text-[rgba(246,246,253,0.35)] text-[11px]">
              {filtersCollapsed ? "▸ show" : "▾ hide"}
            </span>
          </button>

          {!filtersCollapsed && (
          <div className="px-4 pb-3">
          {/* Capability pills */}
          <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.4)] mb-2">
            Capabilities
          </p>
          <p className="mb-2 text-[11px] leading-relaxed text-[rgba(246,246,253,0.45)]">
            All selected capabilities must match.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label="Filter by capability">
            {FEATURED_CAPABILITIES.map((cap) => {
              const active = capabilityFilters.includes(cap);
              return (
                <button
                  key={cap}
                  type="button"
                  onClick={() => onToggleCapability(cap)}
                  aria-pressed={active}
                  className={`
                    px-2.5 py-1 text-[11px] rounded-md border transition-colors
                    ${
                      active
                        ? "bg-[#696aac] text-white border-[#696aac]"
                        : "bg-[rgba(105,106,172,0.1)] text-[rgba(162,163,233,0.85)] border-[rgba(105,106,172,0.2)] hover:border-[rgba(105,106,172,0.45)] hover:bg-[rgba(105,106,172,0.18)]"
                    }
                  `}
                >
                  {capabilityShortLabel(cap)}
                </button>
              );
            })}
          </div>

          {/* Tier selector */}
          <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.4)] mb-2">
            Tier
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label="Filter by tier">
            {TIER_OPTIONS.map((opt) => {
              const active = tierFilter === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onSetTier(opt.value)}
                  aria-pressed={active}
                  className={`
                    px-2.5 py-1 text-[11px] rounded-md border transition-colors
                    ${
                      active
                        ? "bg-[#696aac] text-white border-[#696aac]"
                        : "bg-[rgba(105,106,172,0.1)] text-[rgba(162,163,233,0.85)] border-[rgba(105,106,172,0.2)] hover:border-[rgba(105,106,172,0.45)]"
                    }
                  `}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Radius selector — only when geocoded */}
          {showRadius && (
            <>
              <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.4)] mb-2">
                Radius
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label="Search radius">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.km}
                    type="button"
                    onClick={() => onSetRadius(opt.km)}
                    aria-pressed={radiusKm === opt.km}
                    className={`
                      px-2.5 py-1 text-[11px] rounded-md border transition-colors
                      ${
                        radiusKm === opt.km
                          ? "bg-[#696aac] text-white border-[#696aac]"
                          : "bg-[rgba(105,106,172,0.1)] text-[rgba(162,163,233,0.85)] border-[rgba(105,106,172,0.2)] hover:border-[rgba(105,106,172,0.45)]"
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Reset */}
          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 text-[11px] text-[rgba(162,163,233,0.7)] hover:text-[rgba(162,163,233,1)] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear all
            </button>
          )}
          </div>
          )}
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          className="flex-1 overflow-y-auto scrollbar-hide"
          onWheel={(e) => e.stopPropagation()}
          role="listbox"
          aria-label="Data center results"
          aria-live="polite"
        >
          {searchStatus === "loading" && (
            <div className="px-5 py-6 text-sm text-[rgba(246,246,253,0.45)]">Searching…</div>
          )}

          {results && results.length === 0 && searchStatus !== "loading" && (
            <div className="px-5 py-6">
              <p className="text-sm text-[rgba(246,246,253,0.5)] mb-1">
                {searchStatus === "no-dc"
                  ? "No data centers in this area."
                  : searchStatus === "no-filter-match"
                    ? "No data centers match these filters."
                    : "No matching data centers found."}
              </p>
              <p className="text-xs text-[rgba(246,246,253,0.3)]">
                {searchStatus === "no-dc"
                  ? "Try increasing the radius or removing filters."
                  : searchStatus === "no-filter-match"
                    ? "Try selecting different capabilities or tiers."
                    : "Try a different location or broadening your filters."}
              </p>
            </div>
          )}

          {results && results.length > 0 && (
            <>
              {/* Count row */}
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.35)]">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
                {results.length > visibleCount && (
                  <span className="text-[10px] text-[rgba(162,163,233,0.5)]">
                    showing {visibleCount} of {results.length}
                  </span>
                )}
              </div>

              {/* Paginated list */}
              <ul className="list-none p-0 m-0">
                {results.slice(0, visibleCount).map((dc) => (
                  <li key={dc.id}>
                    <ResultRow
                      dc={dc}
                      isSelected={dc.id === selectedId}
                      onClick={() => onSelectDc(dc)}
                    />
                  </li>
                ))}
              </ul>

              {/* Load more */}
              {visibleCount < results.length && (
                <div className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                    className="
                      w-full py-2 rounded-xl text-xs font-medium
                      bg-[rgba(105,106,172,0.12)] border border-[rgba(105,106,172,0.22)]
                      text-[rgba(162,163,233,0.8)] hover:bg-[rgba(105,106,172,0.22)] hover:text-[#f6f6fd]
                      transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#696aac]
                    "
                  >
                    Load {Math.min(PAGE_SIZE, results.length - visibleCount)} more
                    <span className="text-[rgba(246,246,253,0.35)] ml-1">
                      ({results.length - visibleCount} remaining)
                    </span>
                  </button>
                </div>
              )}
            </>
          )}

          {!results && searchStatus === "idle" && (
            <div className="px-5 py-6 text-xs text-[rgba(246,246,253,0.3)] leading-relaxed">
              Search by location, ZIP code, capability, or a natural-language phrase like
              &ldquo;edge data centers in Texas&rdquo;.
            </div>
          )}
        </div>
      </div>

      {/* Toggle tab (always visible on desktop when panel closed) */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? "Close panel" : "Open search panel"}
        aria-expanded={isOpen}
        className={`
          fixed z-40 top-1/2 -translate-y-1/2
          h-12 w-6 rounded-r-lg
          bg-[rgba(105,106,172,0.25)] border border-l-0 border-[rgba(105,106,172,0.35)]
          text-[rgba(162,163,233,0.8)] hover:bg-[rgba(105,106,172,0.4)] hover:text-[#f6f6fd]
          transition-all duration-300
          flex items-center justify-center
          ${isOpen ? "left-[340px] xl:left-[380px]" : "left-0"}
        `}
      >
        {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </>
  );
}
