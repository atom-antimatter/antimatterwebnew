"use client";

import Link from "next/link";
import { X, MapPin, ExternalLink, Zap, ArrowRight } from "lucide-react";
import type { ProviderRegion } from "@/lib/providers/linode/types";
import styles from "@/components/ui/css/Button.module.css";

type Props = { region: ProviderRegion; onClose: () => void };

const AVAIL_COLOR: Record<string, string> = {
  true:  "text-green-400  bg-[rgba(52,211,153,0.1)]  border-[rgba(52,211,153,0.25)]",
  false: "text-yellow-400 bg-[rgba(251,191,36,0.1)]  border-[rgba(251,191,36,0.25)]",
};

export default function LinodeCard({ region, onClose }: Props) {
  const loc = [region.city, region.country].filter(Boolean).join(", ");
  const isAvailable = region.availability?.available;
  const availLabel  = isAvailable === true ? "Available" : isAvailable === false ? "Limited / Planned" : "Unknown";
  const availClass  = AVAIL_COLOR[String(isAvailable)] ?? "text-[rgba(246,246,253,0.45)] bg-transparent border-[rgba(246,246,253,0.1)]";

  return (
    <div
      role="region"
      aria-label={`Akamai / Linode — ${region.label}`}
      className="
        fixed top-20 right-4 z-40
        w-[320px] xl:w-[360px]
        max-h-[calc(100vh-100px)]
        overflow-y-auto scrollbar-hide
        bg-[rgba(6,7,15,0.92)] backdrop-blur-xl
        border border-[rgba(246,246,253,0.09)]
        rounded-2xl shadow-2xl flex flex-col
        animate-in fade-in slide-in-from-right-4 duration-300
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3 border-b border-[rgba(246,246,253,0.07)]">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[10px] uppercase tracking-widest text-[rgba(52,211,153,0.7)] mb-0.5">
            Akamai / Linode
          </p>
          <h2 className="text-base font-semibold text-[#f6f6fd] leading-snug">{region.label}</h2>
          {loc && (
            <div className="flex items-center gap-1 mt-1 text-xs text-[rgba(246,246,253,0.55)]">
              <MapPin className="w-3 h-3 shrink-0" />
              {loc}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-[rgba(246,246,253,0.06)] text-[rgba(246,246,253,0.5)] hover:text-[#f6f6fd] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-[rgba(246,246,253,0.07)]">
        <span className="text-[11px] text-[rgba(246,246,253,0.5)] bg-[rgba(246,246,253,0.05)] border border-[rgba(246,246,253,0.09)] rounded px-2 py-0.5 font-mono">
          {region.region_id}
        </span>
        {region.site_type && (
          <span className="text-[11px] text-[rgba(162,163,233,0.8)] bg-[rgba(105,106,172,0.12)] border border-[rgba(105,106,172,0.22)] rounded px-2 py-0.5 capitalize">
            {region.site_type}
          </span>
        )}
        <span className={`text-[11px] border rounded px-2 py-0.5 ${availClass}`}>
          {availLabel}
        </span>
      </div>

      {/* Capabilities */}
      {region.capabilities.length > 0 && (
        <div className="px-4 py-3 border-b border-[rgba(246,246,253,0.07)]">
          <p className="text-[10px] uppercase tracking-widest text-[rgba(246,246,253,0.38)] mb-2">
            Capabilities
          </p>
          <div className="flex flex-wrap gap-1.5">
            {region.capabilities.map(cap => (
              <span
                key={cap}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[rgba(52,211,153,0.08)] text-[rgba(52,211,153,0.85)] border border-[rgba(52,211,153,0.18)]"
              >
                <Zap className="w-2.5 h-2.5" />
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="p-4 flex flex-col gap-2">
        <Link
          href="/contact?source=atlas-linode"
          className={`${styles.button} flex items-center justify-center gap-2 w-full text-sm text-[#f6f6fd]`}
          style={{ padding: "9px 0" }}
        >
          Talk to an architect
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <a
          href="https://www.linode.com/global-infrastructure/availability/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-medium text-[rgba(162,163,233,0.8)] bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.18)] hover:bg-[rgba(52,211,153,0.15)] hover:text-[#f6f6fd] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Provider availability status
        </a>
      </div>

      <p className="px-4 pb-3 text-[10px] text-[rgba(246,246,253,0.25)] text-center">
        Source: Akamai/Linode API v4 — CC0
      </p>
    </div>
  );
}
