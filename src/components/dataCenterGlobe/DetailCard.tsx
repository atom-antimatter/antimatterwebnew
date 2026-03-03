"use client";

import { useState } from "react";
import Link from "next/link";
import { X, MapPin, ExternalLink, Globe, ArrowRight, Zap, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import styles from "@/components/ui/css/Button.module.css";
import type { DataCenter } from "@/data/dataCenters";
import { CAPABILITY_CATALOG, capabilityLabel } from "@/data/capabilityCatalog";
import { usePowerReadiness } from "@/lib/power/usePowerReadiness";
import { useAtlasLayersStore } from "@/state/atlasLayersStore";

// ─── types ────────────────────────────────────────────────────────────────────

export type DetailCardProps = {
  dc: DataCenter;
  onClose: () => void;
};

type Tab = "overview" | "power";

// ─── sub-components ───────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: DataCenter["tier"] }) {
  const map: Record<string, string> = {
    hyperscale: "bg-[rgba(133,135,227,0.2)] text-[#a2a3e9] border-[rgba(133,135,227,0.35)]",
    core: "bg-[rgba(105,106,172,0.2)] text-[#c7c8f2] border-[rgba(105,106,172,0.35)]",
    enterprise: "bg-[rgba(62,63,126,0.22)] text-[#8587e3] border-[rgba(62,63,126,0.38)]",
    edge: "bg-[rgba(162,163,233,0.14)] text-[#696aac] border-[rgba(162,163,233,0.25)]",
  };
  if (!tier) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border uppercase tracking-wider ${map[tier] ?? map.core}`}>
      {tier}
    </span>
  );
}

function StatusBadge({ status }: { status: DataCenter["status"] }) {
  if (!status) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded border ${
      status === "active"
        ? "bg-[rgba(52,211,153,0.1)] text-green-400 border-[rgba(52,211,153,0.25)]"
        : "bg-[rgba(251,191,36,0.1)] text-yellow-400 border-[rgba(251,191,36,0.25)]"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-green-400" : "bg-yellow-400"}`} />
      {status === "active" ? "Active" : "Planned"}
    </span>
  );
}

function CapabilityChip({ id }: { id: string }) {
  const meta = CAPABILITY_CATALOG[id];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[rgba(105,106,172,0.14)] text-[#a2a3e9] border border-[rgba(105,106,172,0.22)]">
      {meta?.label ?? id}
    </span>
  );
}

function buildSummary(dc: DataCenter): string {
  const parts: string[] = [];
  if (dc.provider) parts.push(`${dc.provider}'s`);
  parts.push(dc.tier ? dc.tier : "data center");
  parts.push(`facility in ${[dc.city, dc.country].filter(Boolean).join(", ")}`);
  if (dc.capabilities.length > 0) {
    const caps = dc.capabilities.slice(0, 3).map(capabilityLabel).join(", ");
    parts.push(`offering ${caps}`);
    if (dc.capabilities.length > 3) parts.push(`and more`);
  }
  return parts.join(" ") + ".";
}

// ─── Power Tab ─────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const band = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 50 ? "moderate" : score >= 35 ? "challenging" : "poor";
  const color = { excellent:"#34d399", good:"#60a5fa", moderate:"#fbbf24", challenging:"#f97316", poor:"#ef4444" }[band];
  const r = 32; const circum = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(246,246,253,0.08)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${(score/100)*circum} ${circum}`} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold text-[#f6f6fd] leading-none">{score}</div>
        <div className="text-[9px] capitalize mt-0.5" style={{ color }}>{band}</div>
      </div>
    </div>
  );
}

function PowerTab({ dc }: { dc: DataCenter }) {
  const [enabled, setEnabled] = useState(false);
  const [showCaveats, setShowCaveats] = useState(false);
  const { powerScenario } = useAtlasLayersStore();
  const { state, trigger } = usePowerReadiness({
    lat: dc.lat,
    lng: dc.lng,
    mw: powerScenario.targetMw,
    radiusKm: powerScenario.radiusKm,
    enabled,
  });

  if (!enabled && state.status === "idle") {
    return (
      <div className="px-4 py-6 flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 rounded-full bg-[rgba(105,106,172,0.15)] flex items-center justify-center">
          <Zap className="w-5 h-5 text-[#a2a3e9]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#f6f6fd] mb-1">Power Readiness Assessment</p>
          <p className="text-xs text-[rgba(246,246,253,0.5)] leading-relaxed">
            On-demand feasibility score based on utility rates, grid carbon, nearby generation, and interconnection queue pressure.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled(true)}
          className="mt-1 px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(105,106,172,0.2)] text-[#a2a3e9] border border-[rgba(105,106,172,0.3)] hover:bg-[rgba(105,106,172,0.3)] transition-colors"
        >
          Assess power readiness
        </button>
        <p className="text-[10px] text-[rgba(246,246,253,0.3)]">
          Target: {powerScenario.targetMw} MW · {powerScenario.radiusKm} km radius
        </p>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="px-4 py-6 flex items-center justify-center">
        <p className="text-sm text-[rgba(246,246,253,0.45)]">Computing feasibility…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 text-[rgba(239,68,68,0.8)] text-sm mb-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {state.message}
        </div>
        <button type="button" onClick={trigger} className="text-xs text-[rgba(162,163,233,0.7)] hover:text-[#a2a3e9] transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (state.status === "success") {
    const { result } = state;
    const signals = [
      { label: "Utility Rate",  value: result.signals.rateIndex,   color: "#8587e3" },
      { label: "Grid Carbon",   value: result.signals.carbonIndex, color: "#34d399" },
      { label: "Queue Pressure",value: result.signals.queueIndex,  color: "#fbbf24" },
      { label: "Generation",    value: result.signals.genIndex,    color: "#60a5fa" },
    ];
    return (
      <div className="px-4 py-4 space-y-3">
        {/* Score + summary */}
        <div className="flex items-center gap-4">
          <ScoreRing score={result.score} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#f6f6fd] leading-snug mb-1">Power Feasibility Score</p>
            <p className="text-[11px] text-[rgba(246,246,253,0.5)] leading-relaxed">
              {result.state ? `State: ${result.state} · ` : ""}
              {powerScenario.targetMw} MW target
            </p>
          </div>
        </div>

        {/* Signal breakdown */}
        <div className="grid grid-cols-2 gap-1.5">
          {signals.map(({ label, value, color }) => (
            <div key={label} className="bg-[rgba(246,246,253,0.04)] border border-[rgba(246,246,253,0.07)] rounded-lg px-2.5 py-2">
              <p className="text-[10px] text-[rgba(246,246,253,0.45)] mb-1">{label}</p>
              {value !== null ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1 rounded-full bg-[rgba(246,246,253,0.1)]">
                    <div className="h-1 rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-[11px] font-semibold text-[#f6f6fd]">{value}</span>
                </div>
              ) : (
                <p className="text-[11px] text-[rgba(246,246,253,0.3)]">N/A</p>
              )}
            </div>
          ))}
        </div>

        {/* Rate + carbon quick stats */}
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {result.rateProxy.ratePerKwh !== null && (
            <div className="bg-[rgba(246,246,253,0.03)] rounded-lg px-2.5 py-2">
              <p className="text-[10px] text-[rgba(246,246,253,0.4)] mb-0.5">Est. rate</p>
              <p className="font-medium text-[#f6f6fd]">${(result.rateProxy.ratePerKwh * 100).toFixed(1)}¢/kWh</p>
            </div>
          )}
          {result.carbonProxy.co2LbPerMwh !== null && (
            <div className="bg-[rgba(246,246,253,0.03)] rounded-lg px-2.5 py-2">
              <p className="text-[10px] text-[rgba(246,246,253,0.4)] mb-0.5">Grid carbon</p>
              <p className="font-medium text-[#f6f6fd]">{Math.round(result.carbonProxy.co2LbPerMwh)} lb/MWh</p>
            </div>
          )}
        </div>

        {/* Caveats toggle */}
        {result.caveats.length > 0 && (
          <div>
            <button type="button" onClick={() => setShowCaveats(v => !v)}
              className="w-full flex items-center justify-between text-[10px] text-[rgba(246,246,253,0.4)] hover:text-[rgba(246,246,253,0.6)] transition-colors py-1">
              <span className="uppercase tracking-widest">Caveats & limitations</span>
              {showCaveats ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showCaveats && (
              <ul className="space-y-1 mt-1">
                {result.caveats.map((c, i) => (
                  <li key={i} className="text-[10px] text-[rgba(246,246,253,0.4)] leading-relaxed flex gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-[#fbbf24] shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <button type="button" onClick={trigger}
          className="text-[10px] text-[rgba(162,163,233,0.6)] hover:text-[#a2a3e9] transition-colors">
          Refresh
        </button>
      </div>
    );
  }

  return null;
}

// ─── Main component ────────────────────────────────────────────────────────

export default function DetailCard({ dc, onClose }: DetailCardProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const locationLine = [dc.city, dc.stateOrRegion, dc.country].filter(Boolean).join(", ");
  const summary = buildSummary(dc);

  const tabClass = (t: Tab) =>
    `flex-1 py-2 text-xs font-medium transition-colors ${
      tab === t
        ? "text-[#f6f6fd] border-b-2 border-[#696aac]"
        : "text-[rgba(246,246,253,0.45)] hover:text-[rgba(246,246,253,0.7)] border-b-2 border-transparent"
    }`;

  return (
    <div
      role="region"
      aria-label={`Details for ${dc.name}`}
      className="
        fixed top-20 right-4 z-40
        w-[320px] xl:w-[360px]
        max-h-[calc(100vh-100px)]
        overflow-y-auto scrollbar-hide
        bg-[rgba(6,7,15,0.92)] backdrop-blur-xl
        border border-[rgba(246,246,253,0.09)]
        rounded-2xl shadow-2xl
        flex flex-col
        animate-in fade-in slide-in-from-right-4 duration-300
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3 border-b border-[rgba(246,246,253,0.07)]">
        <div className="flex-1 min-w-0 pr-2">
          {dc.provider && (
            <p className="text-[10px] uppercase tracking-widest text-[rgba(162,163,233,0.6)] mb-0.5">{dc.provider}</p>
          )}
          <h2 className="text-base font-semibold text-[#f6f6fd] leading-snug">{dc.name}</h2>
          <div className="flex items-center gap-1 mt-1 text-xs text-[rgba(246,246,253,0.55)]">
            <MapPin className="w-3 h-3 shrink-0" />
            {locationLine}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close"
          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-[rgba(246,246,253,0.06)] text-[rgba(246,246,253,0.5)] hover:text-[#f6f6fd] transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-[rgba(246,246,253,0.07)]">
        {dc.tier && <TierBadge tier={dc.tier} />}
        <StatusBadge status={dc.status ?? "active"} />
        {dc.postalCode && (
          <span className="text-[11px] text-[rgba(246,246,253,0.4)] bg-[rgba(246,246,253,0.05)] border border-[rgba(246,246,253,0.08)] rounded px-1.5 py-0.5">{dc.postalCode}</span>
        )}
        {dc.source && dc.source !== "curated" && (
          <span className="text-[10px] uppercase tracking-wider text-[rgba(162,163,233,0.7)] bg-[rgba(105,106,172,0.12)] border border-[rgba(105,106,172,0.2)] rounded px-2 py-0.5">{dc.source}</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(246,246,253,0.07)] px-4">
        <button type="button" className={tabClass("overview")} onClick={() => setTab("overview")}>Overview</button>
        <button type="button" className={tabClass("power")} onClick={() => setTab("power")}>
          <span className="flex items-center gap-1 justify-center"><Zap className="w-3 h-3" />Power</span>
        </button>
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <>
          <div className="px-4 py-3 border-b border-[rgba(246,246,253,0.07)]">
            <p className="text-xs text-[rgba(246,246,253,0.55)] leading-relaxed">{summary}</p>
            {dc.notes && <p className="mt-1.5 text-xs text-[rgba(251,191,36,0.7)] leading-relaxed">{dc.notes}</p>}
          </div>

          {dc.capabilities.length > 0 && (
            <div className="px-4 py-3 border-b border-[rgba(246,246,253,0.07)]">
              <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.38)] mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-1.5">
                {dc.capabilities.map(cap => <CapabilityChip key={cap} id={cap} />)}
              </div>
            </div>
          )}

          {dc.connections && dc.connections.length > 0 && (
            <div className="px-4 py-3 border-b border-[rgba(246,246,253,0.07)]">
              <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.38)] mb-2">Connectivity</p>
              <ul className="space-y-1 list-none p-0 m-0">
                {dc.connections.map((conn, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[rgba(246,246,253,0.5)]">
                    <Globe className="w-3 h-3 text-[rgba(105,106,172,0.7)] shrink-0" />
                    <span className="capitalize">{conn.type.replace(/-/g, " ")}</span>
                    {conn.bandwidth && <span className="ml-auto text-[10px] text-[rgba(162,163,233,0.6)]">{conn.bandwidth}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-4 flex flex-col gap-2">
            <Link href="/contact?source=atlas"
              className={`${styles.button} flex items-center justify-center gap-2 w-full text-sm text-[#f6f6fd]`}
              style={{ padding: "9px 0" }}>
              Talk to an architect<ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {dc.website && (
              <a href={dc.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-medium text-[rgba(162,163,233,0.8)] bg-[rgba(105,106,172,0.1)] border border-[rgba(105,106,172,0.22)] hover:bg-[rgba(105,106,172,0.2)] hover:text-[#f6f6fd] transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />Visit site
              </a>
            )}
            {dc.source === "osm" && dc.sourceId && (
              <a href={`https://www.openstreetmap.org/edit?way=${dc.sourceId}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 h-8 text-[11px] text-[rgba(246,246,253,0.35)] hover:text-[rgba(246,246,253,0.6)] transition-colors">
                <ExternalLink className="w-3 h-3" />Edit on OpenStreetMap
              </a>
            )}
            {dc.licenseNote && <p className="text-[10px] text-[rgba(246,246,253,0.25)] text-center mt-0.5">{dc.licenseNote}</p>}
          </div>
        </>
      )}

      {tab === "power" && <PowerTab dc={dc} />}
    </div>
  );
}
