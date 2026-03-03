"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Zap, Leaf, Activity, AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { scoreBand, type PowerFeasibilityResult } from "@/lib/power/scorePowerFeasibility";

// ─── Types ────────────────────────────────────────────────────────────────────

type SiteBriefProps = {
  lat: number;
  lng: number;
  onClose: () => void;
  targetMw?: number;
  radiusKm?: number;
};

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const band = scoreBand(score);
  const colorMap: Record<string, string> = {
    excellent: "#34d399",   // emerald
    good: "#60a5fa",        // blue
    moderate: "#fbbf24",    // amber
    challenging: "#f97316", // orange
    poor: "#ef4444",        // red
  };
  const color = colorMap[band] ?? "#696aac";

  const r = 40;
  const circum = 2 * Math.PI * r;
  const strokeDash = (score / 100) * circum;

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
        {/* Track */}
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(246,246,253,0.08)" strokeWidth="8" />
        {/* Fill */}
        <circle
          cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${strokeDash} ${circum}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold text-[#f6f6fd] leading-none">{score}</div>
        <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color }}>
          {band}
        </div>
      </div>
    </div>
  );
}

// ─── Signal card ──────────────────────────────────────────────────────────────

function SignalCard({
  icon: Icon,
  label,
  value,
  helper,
  score,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  helper?: string;
  score: number | null;
  color: string;
}) {
  return (
    <div className="bg-[rgba(246,246,253,0.04)] border border-[rgba(246,246,253,0.07)] rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
        <span className="text-[11px] uppercase tracking-widest text-[rgba(246,246,253,0.45)]">{label}</span>
        {score !== null && (
          <span className="ml-auto text-[11px] font-semibold" style={{ color }}>
            {score}/100
          </span>
        )}
      </div>
      <div className="text-sm font-medium text-[#f6f6fd]">{value}</div>
      {helper && <div className="text-[11px] text-[rgba(246,246,253,0.45)] mt-0.5">{helper}</div>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SiteBrief({ lat, lng, onClose, targetMw = 100, radiusKm = 80 }: SiteBriefProps) {
  const [data, setData] = useState<PowerFeasibilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCaveats, setShowCaveats] = useState(false);

  const fetchSiteBrief = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/power/site?lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}&mw=${targetMw}&radiusKm=${radiusKm}`
      );
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message ?? "Failed to load power data");
    } finally {
      setLoading(false);
    }
  }, [lat, lng, targetMw, radiusKm]);

  useEffect(() => { fetchSiteBrief(); }, [fetchSiteBrief]);

  const fuelLabel: Record<string, string> = {
    NUC: "Nuclear", WAT: "Hydro", NG: "Gas", SUN: "Solar",
    WND: "Wind", COL: "Coal", SUB: "Coal", BAT: "Battery", GEO: "Geothermal",
  };

  return (
    <div
      role="region"
      aria-label="Site Power Brief"
      className="
        fixed top-20 right-4 z-40
        w-[340px] xl:w-[360px]
        max-h-[calc(100vh-100px)]
        overflow-y-auto scrollbar-hide
        bg-[rgba(6,7,15,0.94)] backdrop-blur-xl
        border border-[rgba(246,246,253,0.09)]
        rounded-2xl shadow-2xl
        flex flex-col
        animate-in fade-in slide-in-from-right-4 duration-300
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3 border-b border-[rgba(246,246,253,0.07)]">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Zap className="w-3.5 h-3.5 text-[#a2a3e9]" />
            <span className="text-[10px] uppercase tracking-widest text-[rgba(162,163,233,0.7)]">Power Feasibility</span>
          </div>
          <h2 className="text-sm font-semibold text-[#f6f6fd] leading-snug">
            {lat.toFixed(3)}°, {lng.toFixed(3)}°
          </h2>
          <p className="text-[11px] text-[rgba(246,246,253,0.45)] mt-0.5">
            {targetMw} MW target · {radiusKm} km radius
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close site brief"
          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-[rgba(246,246,253,0.06)] text-[rgba(246,246,253,0.5)] hover:text-[#f6f6fd] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-sm text-[rgba(246,246,253,0.45)]">
          Computing feasibility…
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="px-4 py-4 text-sm text-[rgba(239,68,68,0.8)]">
          <AlertTriangle className="inline w-3.5 h-3.5 mr-1" />
          {error}
        </div>
      )}

      {/* Content */}
      {data && !loading && (
        <>
          {/* Score */}
          <div className="flex items-center gap-5 px-5 py-4 border-b border-[rgba(246,246,253,0.07)]">
            <ScoreRing score={data.score} />
            <div>
              <p className="text-[13px] font-semibold text-[#f6f6fd] leading-snug mb-1">
                Power Feasibility Score
              </p>
              <p className="text-[11px] text-[rgba(246,246,253,0.5)] leading-relaxed">
                Composite signal from utility rates, grid carbon, generation proximity, and interconnection queue pressure.
              </p>
              {data.state && (
                <span className="inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[rgba(105,106,172,0.2)] text-[#a2a3e9]">
                  State: {data.state}
                </span>
              )}
            </div>
          </div>

          {/* Signal breakdown */}
          <div className="px-4 py-3 grid grid-cols-2 gap-2 border-b border-[rgba(246,246,253,0.07)]">
            <SignalCard
              icon={Zap}
              label="Utility Rate"
              value={data.rateProxy.ratePerKwh != null
                ? `$${(data.rateProxy.ratePerKwh * 100).toFixed(1)}¢/kWh`
                : "Unknown"}
              helper="State avg, industrial (EIA 2023)"
              score={data.signals.rateIndex}
              color="#8587e3"
            />
            <SignalCard
              icon={Leaf}
              label="Grid Carbon"
              value={data.carbonProxy.co2LbPerMwh != null
                ? `${Math.round(data.carbonProxy.co2LbPerMwh)} lb/MWh`
                : "Unknown"}
              helper={`eGRID 2022 annual avg`}
              score={data.signals.carbonIndex}
              color="#34d399"
            />
            <SignalCard
              icon={Activity}
              label="Queue Pressure"
              value={data.queueProxy.queuedMw != null
                ? `${(data.queueProxy.queuedMw / 1000).toFixed(0)} GW queued`
                : "Unknown"}
              helper={`${data.queueProxy.iso ?? "ISO"} — ${data.queueProxy.source === "static_summary" ? "state summary" : "DB"}`}
              score={data.signals.queueIndex}
              color="#fbbf24"
            />
            <SignalCard
              icon={Zap}
              label="Nearby Gen."
              value={data.nearbyPlants.length > 0
                ? `${data.nearbyPlants.length} plants found`
                : "None in dataset"}
              helper={`within ${radiusKm} km · EIA-860`}
              score={data.signals.genIndex}
              color="#60a5fa"
            />
          </div>

          {/* Nearby generation */}
          {data.nearbyPlants.length > 0 && (
            <div className="px-4 py-3 border-b border-[rgba(246,246,253,0.07)]">
              <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.38)] mb-2">
                Nearby Generation (top 5)
              </p>
              <ul className="space-y-1 list-none p-0 m-0">
                {data.nearbyPlants.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 text-xs text-[rgba(246,246,253,0.6)]">
                    <span className="w-12 text-right font-mono text-[rgba(162,163,233,0.8)]">
                      {Math.round(p.capacityMw)} MW
                    </span>
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-[10px] text-[rgba(246,246,253,0.35)]">
                      {fuelLabel[p.fuelType] ?? p.fuelType}
                    </span>
                    <span className="text-[10px] text-[rgba(246,246,253,0.3)]">
                      {p.distanceKm.toFixed(0)} km
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Caveats section */}
          <div className="border-b border-[rgba(246,246,253,0.07)]">
            <button
              type="button"
              onClick={() => setShowCaveats((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-[11px] uppercase tracking-widest text-[rgba(246,246,253,0.45)]">
                Caveats & limitations
              </span>
              {showCaveats ? (
                <ChevronUp className="w-3.5 h-3.5 text-[rgba(246,246,253,0.35)]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[rgba(246,246,253,0.35)]" />
              )}
            </button>
            {showCaveats && (
              <ul className="px-4 pb-3 space-y-1.5 list-none p-0 m-0">
                {data.caveats.map((c, i) => (
                  <li key={i} className="text-[11px] text-[rgba(246,246,253,0.5)] leading-relaxed flex gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-[#fbbf24] shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Attribution */}
          <div className="px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.3)] mb-1.5">
              Data sources
            </p>
            <ul className="space-y-1 list-none p-0 m-0">
              {data.attribution.map((a, i) => (
                <li key={i} className="text-[10px] text-[rgba(246,246,253,0.35)] leading-relaxed">{a}</li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap gap-2">
              <a href="https://openei.org/wiki/Utility_Rate_Database" target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-[rgba(162,163,233,0.6)] hover:text-[#a2a3e9] flex items-center gap-0.5">
                <ExternalLink className="w-2.5 h-2.5" /> URDB
              </a>
              <a href="https://www.eia.gov/electricity/data/eia860/" target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-[rgba(162,163,233,0.6)] hover:text-[#a2a3e9] flex items-center gap-0.5">
                <ExternalLink className="w-2.5 h-2.5" /> EIA-860
              </a>
              <a href="https://www.epa.gov/egrid" target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-[rgba(162,163,233,0.6)] hover:text-[#a2a3e9] flex items-center gap-0.5">
                <ExternalLink className="w-2.5 h-2.5" /> eGRID
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
