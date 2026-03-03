"use client";
/**
 * PowerReadinessTab — lives inside the left CommandPanel "Power" tab.
 * Fully scrollable, no map overlay.
 */
import { useState } from "react";
import { Zap, AlertTriangle, ChevronDown, ChevronUp, RefreshCw, MapPin, X, Target } from "lucide-react";
import { useAtlasLayersStore } from "@/state/atlasLayersStore";
import { usePowerReadiness } from "@/lib/power/usePowerReadiness";
import type { DataCenter } from "@/data/dataCenters";
import type { PowerFeasibilityResult } from "@/lib/power/scorePowerFeasibility";

// ─── Score ring ─────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const band  = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 50 ? "moderate" : score >= 35 ? "challenging" : "poor";
  const color = { excellent:"#34d399", good:"#60a5fa", moderate:"#fbbf24", challenging:"#f97316", poor:"#ef4444" }[band];
  const r     = 28; const c = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(246,246,253,0.08)" strokeWidth="5"/>
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${(score/100)*c} ${c}`} strokeLinecap="round"/>
      </svg>
      <div className="absolute text-center leading-none px-0.5 w-full">
        <div className="text-lg font-bold text-[#f6f6fd]">{score}</div>
        <div
          className="capitalize leading-tight"
          style={{ color, fontSize: band.length > 8 ? '6.5px' : '8px' }}
        >
          {band}
        </div>
      </div>
    </div>
  );
}

// ─── Signal card ─────────────────────────────────────────────────────────────

function SignalCard({ label, icon: Icon, value, score, color }: {
  label: string; icon: React.ElementType;
  value: string; score: number | null; color: string;
}) {
  return (
    <div className="bg-[rgba(246,246,253,0.04)] border border-[rgba(246,246,253,0.07)] rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3 h-3 shrink-0" style={{ color }} />
        <span className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.45)]">{label}</span>
        {score !== null && (
          <span className="ml-auto text-[11px] font-semibold" style={{ color }}>{score}/100</span>
        )}
      </div>
      <p className="text-sm font-medium text-[#f6f6fd]">{value}</p>
    </div>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

function PowerResults({ result, onReload }: { result: PowerFeasibilityResult; onReload: () => void }) {
  const [showCaveats, setShowCaveats] = useState(false);

  const missing = ["rateIndex","genIndex","carbonIndex","queueIndex"]
    .filter(k => result.signals[k as keyof typeof result.signals] === null)
    .map(k => k.replace("Index",""));

  return (
    <div className="space-y-3">
      {/* Score headline */}
      <div className="flex items-center gap-4 bg-[rgba(246,246,253,0.03)] rounded-xl p-3">
        <ScoreRing score={result.score} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#f6f6fd] mb-0.5">Power Feasibility</p>
          <p className="text-[11px] text-[rgba(246,246,253,0.5)]">
            {result.state ? `${result.state} · ` : ""}
            Composite score
          </p>
          <button
            type="button" onClick={onReload}
            className="mt-1.5 flex items-center gap-1 text-[10px] text-[rgba(162,163,233,0.6)] hover:text-[#a2a3e9] transition-colors"
          >
            <RefreshCw className="w-2.5 h-2.5" /> Reload
          </button>
        </div>
      </div>

      {/* Coverage warning */}
      {missing.length > 0 && (
        <div className="flex items-start gap-2 bg-[rgba(251,191,36,0.06)] border border-[rgba(251,191,36,0.2)] rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#fbbf24] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[rgba(246,246,253,0.65)]">
            <span className="text-[#fbbf24] font-medium">Some signals US-only.</span>{" "}
            Missing: {missing.join(", ")}
          </p>
        </div>
      )}

      {/* Signal grid */}
      <div className="grid grid-cols-2 gap-2">
        <SignalCard
          label="Utility Rate" icon={Zap} color="#8587e3"
          value={result.rateProxy.ratePerKwh !== null ? `$${(result.rateProxy.ratePerKwh*100).toFixed(1)}¢/kWh` : "N/A"}
          score={result.signals.rateIndex}
        />
        <SignalCard
          label="Grid Carbon" icon={Zap} color="#34d399"
          value={result.carbonProxy.co2LbPerMwh !== null ? `${Math.round(result.carbonProxy.co2LbPerMwh)} lb/MWh` : "N/A"}
          score={result.signals.carbonIndex}
        />
        <SignalCard
          label="Queue Pressure" icon={Zap} color="#fbbf24"
          value={result.queueProxy.queuedMw !== null ? `${(result.queueProxy.queuedMw/1000).toFixed(0)} GW queued` : "N/A"}
          score={result.signals.queueIndex}
        />
        <SignalCard
          label="Nearby Gen." icon={Zap} color="#60a5fa"
          value={result.nearbyPlants.length > 0 ? `${result.nearbyPlants.length} plants` : "None in dataset"}
          score={result.signals.genIndex}
        />
      </div>

      {/* Caveats */}
      {result.caveats.length > 0 && (
        <div className="border border-[rgba(246,246,253,0.07)] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCaveats(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
          >
            <span className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.4)]">
              Caveats &amp; Limitations
            </span>
            {showCaveats ? <ChevronUp className="w-3.5 h-3.5 text-[rgba(246,246,253,0.3)]"/>
                         : <ChevronDown className="w-3.5 h-3.5 text-[rgba(246,246,253,0.3)]"/>}
          </button>
          {showCaveats && (
            <div className="px-3 pb-3 space-y-1.5 border-t border-[rgba(246,246,253,0.07)]">
              {result.caveats.map((c, i) => (
                <div key={i} className="flex gap-2 pt-2">
                  <AlertTriangle className="w-3 h-3 text-[#fbbf24] shrink-0 mt-0.5"/>
                  <p className="text-[10px] text-[rgba(246,246,253,0.5)] leading-relaxed">{c}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sources */}
      {result.attribution.length > 0 && (
        <div className="pt-1">
          <p className="text-[9px] uppercase tracking-widest text-[rgba(246,246,253,0.3)] mb-1.5">Data Sources</p>
          {result.attribution.map((a, i) => (
            <p key={i} className="text-[10px] text-[rgba(246,246,253,0.35)] leading-relaxed">{a}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main tab component ────────────────────────────────────────────────────

export type PowerReadinessTabProps = {
  selectedDc?:   DataCenter | null;
  pinnedPoint?:  { lat: number; lng: number } | null;
  onPinCenter?:  () => void;
  onClearPin?:   () => void;
};

const MW_OPTIONS  = [25, 50, 100, 200] as const;
const KM_OPTIONS  = [25, 50, 80, 120]  as const;

export default function PowerReadinessTab({
  selectedDc, pinnedPoint, onPinCenter, onClearPin,
}: PowerReadinessTabProps) {
  const { powerScenario, setPowerScenario } = useAtlasLayersStore();
  const [fetchEnabled, setFetchEnabled] = useState(false);

  // Derive target for display + fetch
  const target = pinnedPoint ?? (selectedDc ? { lat: selectedDc.lat, lng: selectedDc.lng } : null);
  const targetLabel = selectedDc
    ? `${selectedDc.name}${selectedDc.provider ? ` · ${selectedDc.provider}` : ""}`
    : pinnedPoint
    ? "Pinned point"
    : null;

  const { state, trigger, reload } = usePowerReadiness({
    lat:      target?.lat ?? null,
    lng:      target?.lng ?? null,
    mw:       powerScenario.targetMw,
    radiusKm: powerScenario.radiusKm,
    enabled:  fetchEnabled && !!target,
  });

  const handleAssess = () => {
    if (!target) return;
    if (fetchEnabled) { trigger(false); }
    else              { setFetchEnabled(true); }
  };

  const handleReload = () => {
    setFetchEnabled(true);
    reload();
  };

  const handleClear = () => {
    setFetchEnabled(false);
    onClearPin?.();
  };

  return (
    /* This outer div fills the flex-1 from CommandPanel body and allows scroll */
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-[rgba(105,106,172,0.3)]">

      {/* Target display */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.4)] mb-2">Target Location</p>
        {target ? (
          <div className="flex items-start gap-2 bg-[rgba(105,106,172,0.12)] border border-[rgba(105,106,172,0.25)] rounded-xl px-3 py-2.5">
            <MapPin className="w-3.5 h-3.5 text-[#a2a3e9] shrink-0 mt-0.5"/>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#f6f6fd] truncate">{targetLabel}</p>
              <p className="text-[10px] text-[rgba(246,246,253,0.5)] mt-0.5">
                {target.lat.toFixed(4)}, {target.lng.toFixed(4)}
              </p>
            </div>
            <button type="button" onClick={handleClear}
              className="text-[rgba(246,246,253,0.35)] hover:text-[#f6f6fd] transition-colors flex-shrink-0">
              <X className="w-3.5 h-3.5"/>
            </button>
          </div>
        ) : (
          <div className="bg-[rgba(246,246,253,0.03)] border border-dashed border-[rgba(246,246,253,0.12)] rounded-xl px-4 py-4 text-center">
            <MapPin className="w-5 h-5 text-[rgba(246,246,253,0.25)] mx-auto mb-2"/>
            <p className="text-[11px] text-[rgba(246,246,253,0.45)] leading-relaxed">
              Click a data center or tap anywhere on the map to pin a location.
            </p>
          </div>
        )}
      </div>

      {/* Use map center */}
      {onPinCenter && (
        <button
          type="button" onClick={onPinCenter}
          className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-[11px] text-[rgba(162,163,233,0.8)] bg-[rgba(105,106,172,0.08)] border border-[rgba(105,106,172,0.2)] hover:bg-[rgba(105,106,172,0.18)] transition-colors"
        >
          <Target className="w-3 h-3"/> Use map center
        </button>
      )}

      {/* Scenario controls */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.4)] mb-2">Target Load (MW)</p>
        <div className="flex gap-1.5 flex-wrap">
          {MW_OPTIONS.map(mw => (
            <button key={mw} type="button"
              onClick={() => setPowerScenario({ ...powerScenario, targetMw: mw })}
              className={`px-3 py-1 text-[11px] rounded-lg border transition-colors ${
                powerScenario.targetMw === mw
                  ? "bg-[#696aac] text-white border-[#696aac]"
                  : "bg-[rgba(105,106,172,0.1)] text-[rgba(162,163,233,0.8)] border-[rgba(105,106,172,0.2)] hover:border-[rgba(105,106,172,0.4)]"
              }`}>
              {mw} MW
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.4)] mb-2">Search Radius</p>
        <div className="flex gap-1.5 flex-wrap">
          {KM_OPTIONS.map(km => (
            <button key={km} type="button"
              onClick={() => setPowerScenario({ ...powerScenario, radiusKm: km })}
              className={`px-3 py-1 text-[11px] rounded-lg border transition-colors ${
                powerScenario.radiusKm === km
                  ? "bg-[#696aac] text-white border-[#696aac]"
                  : "bg-[rgba(105,106,172,0.1)] text-[rgba(162,163,233,0.8)] border-[rgba(105,106,172,0.2)] hover:border-[rgba(105,106,172,0.4)]"
              }`}>
              {km} km
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button" onClick={handleAssess}
          disabled={!target}
          className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-sm font-medium transition-colors ${
            target
              ? "bg-[#696aac] text-white hover:bg-[#8587e3]"
              : "bg-[rgba(246,246,253,0.06)] text-[rgba(246,246,253,0.3)] cursor-not-allowed"
          }`}
        >
          <Zap className="w-3.5 h-3.5"/> Assess
        </button>
        {fetchEnabled && (
          <button
            type="button" onClick={handleReload}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-medium bg-[rgba(105,106,172,0.12)] text-[rgba(162,163,233,0.8)] border border-[rgba(105,106,172,0.22)] hover:bg-[rgba(105,106,172,0.22)] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5"/>
          </button>
        )}
      </div>

      {/* Results area */}
      {state.status === "loading" && (
        <div className="flex items-center justify-center py-8 text-sm text-[rgba(246,246,253,0.45)]">
          Computing feasibility…
        </div>
      )}
      {state.status === "error" && (
        <div className="flex items-start gap-2 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444] shrink-0 mt-0.5"/>
          <div>
            <p className="text-[11px] text-[rgba(239,68,68,0.9)]">{state.message}</p>
            <button type="button" onClick={handleReload} className="mt-1 text-[10px] text-[rgba(162,163,233,0.6)] hover:text-[#a2a3e9] transition-colors">Retry</button>
          </div>
        </div>
      )}
      {state.status === "success" && (
        <PowerResults result={state.result} onReload={handleReload} />
      )}
    </div>
  );
}
