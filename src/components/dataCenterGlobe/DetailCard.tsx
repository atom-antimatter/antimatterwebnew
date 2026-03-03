"use client";

import Link from "next/link";
import { X, MapPin, ExternalLink, Globe, ArrowRight } from "lucide-react";
import styles from "@/components/ui/css/Button.module.css";
import type { DataCenter } from "@/data/dataCenters";
import { CAPABILITY_CATALOG, capabilityLabel } from "@/data/capabilityCatalog";

// ─── types ────────────────────────────────────────────────────────────────────

export type DetailCardProps = {
  dc: DataCenter;
  onClose: () => void;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: DataCenter["tier"] }) {
  const map: Record<string, string> = {
    hyperscale: "bg-[rgba(133,135,227,0.2)] text-[#a2a3e9] border-[rgba(133,135,227,0.35)]",
    core: "bg-[rgba(105,106,172,0.2)] text-[#c7c8f2] border-[rgba(105,106,172,0.35)]",
    enterprise: "bg-[rgba(62,63,126,0.22)] text-[#8587e3] border-[rgba(62,63,126,0.38)]",
    edge: "bg-[rgba(162,163,233,0.14)] text-[#696aac] border-[rgba(162,163,233,0.25)]",
  };
  if (!tier) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border uppercase tracking-wider ${map[tier] ?? map.core}`}
    >
      {tier}
    </span>
  );
}

function StatusBadge({ status }: { status: DataCenter["status"] }) {
  if (!status) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded border ${
        status === "active"
          ? "bg-[rgba(52,211,153,0.1)] text-green-400 border-[rgba(52,211,153,0.25)]"
          : "bg-[rgba(251,191,36,0.1)] text-yellow-400 border-[rgba(251,191,36,0.25)]"
      }`}
    >
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

/** Auto-generate a one-liner capability summary. */
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

// ─── component ────────────────────────────────────────────────────────────────

export default function DetailCard({ dc, onClose }: DetailCardProps) {
  const locationLine = [dc.city, dc.stateOrRegion, dc.country].filter(Boolean).join(", ");
  const summary = buildSummary(dc);

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
      {/* Close */}
      <div className="flex items-start justify-between p-4 pb-3 border-b border-[rgba(246,246,253,0.07)]">
        <div className="flex-1 min-w-0 pr-2">
          {dc.provider && (
            <p className="text-[10px] uppercase tracking-widest text-[rgba(162,163,233,0.6)] mb-0.5">
              {dc.provider}
            </p>
          )}
          <h2 className="text-base font-semibold text-[#f6f6fd] leading-snug">{dc.name}</h2>
          <div className="flex items-center gap-1 mt-1 text-xs text-[rgba(246,246,253,0.55)]">
            <MapPin className="w-3 h-3 shrink-0" />
            {locationLine}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail card"
          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-[rgba(246,246,253,0.06)] text-[rgba(246,246,253,0.5)] hover:text-[#f6f6fd] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-[rgba(246,246,253,0.07)]">
        {dc.tier && <TierBadge tier={dc.tier} />}
        <StatusBadge status={dc.status ?? "active"} />
        {dc.postalCode && (
          <span className="text-[11px] text-[rgba(246,246,253,0.4)] bg-[rgba(246,246,253,0.05)] border border-[rgba(246,246,253,0.08)] rounded px-1.5 py-0.5">
            {dc.postalCode}
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="px-4 py-3 border-b border-[rgba(246,246,253,0.07)]">
        <p className="text-xs text-[rgba(246,246,253,0.55)] leading-relaxed">{summary}</p>
        {dc.notes && (
          <p className="mt-1.5 text-xs text-[rgba(251,191,36,0.7)] leading-relaxed">{dc.notes}</p>
        )}
      </div>

      {/* Capabilities */}
      {dc.capabilities.length > 0 && (
        <div className="px-4 py-3 border-b border-[rgba(246,246,253,0.07)]">
          <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.38)] mb-2">
            Capabilities
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dc.capabilities.map((cap) => (
              <CapabilityChip key={cap} id={cap} />
            ))}
          </div>
        </div>
      )}

      {/* Connections */}
      {dc.connections && dc.connections.length > 0 && (
        <div className="px-4 py-3 border-b border-[rgba(246,246,253,0.07)]">
          <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.38)] mb-2">
            Connectivity
          </p>
          <ul className="space-y-1 list-none p-0 m-0">
            {dc.connections.map((conn, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-[rgba(246,246,253,0.5)]">
                <Globe className="w-3 h-3 text-[rgba(105,106,172,0.7)] shrink-0" />
                <span className="capitalize">{conn.type.replace(/-/g, " ")}</span>
                {conn.bandwidth && (
                  <span className="ml-auto text-[10px] text-[rgba(162,163,233,0.6)]">
                    {conn.bandwidth}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTAs */}
      <div className="p-4 flex flex-col gap-2">
        <Link
          href="/contact?source=atlas"
          className={`${styles.button} flex items-center justify-center gap-2 w-full text-sm text-[#f6f6fd]`}
          style={{ padding: "9px 0" }}
        >
          Talk to an architect
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        {dc.website && (
          <a
            href={dc.website}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center justify-center gap-2
              h-9 rounded-xl text-sm font-medium
              text-[rgba(162,163,233,0.8)] bg-[rgba(105,106,172,0.1)]
              border border-[rgba(105,106,172,0.22)]
              hover:bg-[rgba(105,106,172,0.2)] hover:text-[#f6f6fd]
              transition-colors
            "
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Visit site
          </a>
        )}
      </div>
    </div>
  );
}
