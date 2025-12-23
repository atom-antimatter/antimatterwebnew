"use client";

import { vendors as vendorMatrixVendors, type Vendor } from "@/data/vendorMatrix";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./EnterpriseCompareStrip.module.css";
import { useRouter } from "next/navigation";

type VendorSlug =
  | "atom"
  | "kore"
  | "intercom"
  | "zendesk"
  | "servicenow"
  | "copilot"
  | "vertex"
  | "amazonq"
  | "watsonx"
  | "cognigy"
  | "moveworks"
  | "sierra";

type CompareVendor = {
  id: Vendor["id"];
  slug: VendorSlug;
};

const COMPARE_VENDORS: readonly CompareVendor[] = [
  { id: "atom", slug: "atom" },
  { id: "kore-ai", slug: "kore" },
  { id: "intercom-fin", slug: "intercom" },
  { id: "zendesk", slug: "zendesk" },
  { id: "servicenow", slug: "servicenow" },
  { id: "microsoft-copilot", slug: "copilot" },
  { id: "google-vertex", slug: "vertex" },
  { id: "amazon-q", slug: "amazonq" },
  { id: "ibm-watsonx", slug: "watsonx" },
  { id: "cognigy", slug: "cognigy" },
  { id: "moveworks", slug: "moveworks" },
  { id: "sierra", slug: "sierra" },
] as const;

const ATOM_STRENGTH_BULLETS = [
  "Faster voice + real-time GenUI experiences",
  "Private VPC / on-prem / hybrid deployment options",
  "Client-owned IP: prompts, agents, workflows, outputs",
] as const;

function trackClick(vendor: VendorSlug) {
  try {
    const w = window as any;
    if (typeof w.gtag === "function") {
      w.gtag("event", "enterprise_compare_click", {
        vendor,
        source: "enterprise_hero_logo_strip",
      });
    }
  } catch {
    // no-op
  }
}

function buildCompareHref(vendorId: string) {
  const base = "/resources/vendor-matrix";
  if (vendorId === "atom") return `${base}?vendors=atom`;
  return `${base}?vendors=atom,${encodeURIComponent(vendorId)}`;
}

export default function EnterpriseCompareStrip() {
  const router = useRouter();
  const [active, setActive] = useState<{ id: string; slug: VendorSlug } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(pointer: coarse)");
    const update = () => setIsCoarsePointer(Boolean(mq?.matches));
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);

  const vendorList = useMemo(() => {
    const byId = new Map(vendorMatrixVendors.map((v) => [v.id, v]));
    return COMPARE_VENDORS.map((cfg) => {
      const v = byId.get(cfg.id);
      if (!v) return null;
      return { ...v, slug: cfg.slug };
    }).filter(Boolean) as Array<Vendor & { slug: VendorSlug }>;
  }, []);

  const closeTooltip = useCallback(() => {
    setActive(null);
    setTooltipPos(null);
    activeButtonRef.current = null;
  }, []);

  const positionTooltipFromEl = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const tipW = 320;
    const tipH = 160;
    const pad = 12;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    const left = Math.min(Math.max(rect.left + rect.width / 2 - tipW / 2, pad), vpW - tipW - pad);
    const topPreferred = rect.top - tipH - 12;
    const top = topPreferred > pad ? topPreferred : Math.min(rect.bottom + 12, vpH - tipH - pad);
    setTooltipPos({ left, top });
  }, []);

  const openTooltip = useCallback(
    (v: { id: string; slug: VendorSlug }, el: HTMLButtonElement) => {
      setActive(v);
      activeButtonRef.current = el;
      positionTooltipFromEl(el);
    },
    [positionTooltipFromEl]
  );

  useEffect(() => {
    if (!active) return;
    const onScroll = () => {
      const el = activeButtonRef.current;
      if (!el) return;
      positionTooltipFromEl(el);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [active, positionTooltipFromEl]);

  const navigateToCompare = useCallback(
    (vendorId: string, slug: VendorSlug) => {
      trackClick(slug);
      router.push(buildCompareHref(vendorId));
    },
    [router]
  );

  return (
    <section aria-label="Compare Enterprise AI" className="w-full">
      <div className="rounded-2xl border border-foreground/15 bg-background/20 backdrop-blur px-6 sm:px-8 py-8">
        <p className="text-xs tracking-widest uppercase text-foreground/60">
          Compare Enterprise AI
        </p>
        <div className="mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold">
              See how Atom stacks up
            </h2>
            <p className="mt-2 text-sm text-foreground/70 max-w-[70ch]">
              Compare UX, security, deployment, and IP ownership across leading enterprise platforms.
            </p>
          </div>
        </div>

        {/* Desktop grid */}
        <div className="mt-8 hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {vendorList.map((v) => (
            <button
              key={v.id}
              type="button"
              className={[
                "relative rounded-xl border border-foreground/15 bg-[#0b0b0f]/60",
                "px-4 py-4 flex items-center justify-center",
                "transition-colors transition-shadow",
                "hover:border-secondary/40 hover:bg-[#0b0b0f]/80 hover:shadow-[0_0_0_1px_rgba(123,124,255,.18)]",
                "focus:outline-none focus:ring-2 focus:ring-secondary/60 focus:ring-offset-2 focus:ring-offset-background",
              ].join(" ")}
              onMouseEnter={(e) => openTooltip({ id: v.id, slug: v.slug }, e.currentTarget)}
              onMouseLeave={() => closeTooltip()}
              onFocus={(e) => openTooltip({ id: v.id, slug: v.slug }, e.currentTarget)}
              onBlur={() => closeTooltip()}
              onClick={() => navigateToCompare(v.id, v.slug)}
              aria-label={`Compare Atom with ${v.name}`}
            >
              <Image
                src={v.logoUrl}
                alt={v.name}
                width={160}
                height={44}
                className="h-8 w-auto opacity-95"
              />
            </button>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="mt-6 sm:hidden">
          <div
            className={`overflow-x-auto overflow-y-hidden scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${styles.mobileScroller}`}
          >
            <div className="flex gap-3 pr-8">
              {vendorList.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={[
                    "flex-none w-[160px] rounded-xl border border-foreground/15 bg-[#0b0b0f]/60",
                    "px-4 py-4 flex items-center justify-center",
                    "transition-colors transition-shadow",
                    "active:border-secondary/40 active:bg-[#0b0b0f]/80",
                    "focus:outline-none focus:ring-2 focus:ring-secondary/60 focus:ring-offset-2 focus:ring-offset-background",
                  ].join(" ")}
                  onClick={(e) => {
                    // On mobile, first tap opens tooltip; comparison is via tooltip CTA.
                    e.preventDefault();
                    openTooltip({ id: v.id, slug: v.slug }, e.currentTarget);
                  }}
                  aria-label={`Open details for ${v.name}`}
                >
                  <Image
                    src={v.logoUrl}
                    alt={v.name}
                    width={160}
                    height={44}
                    className="h-8 w-auto opacity-95"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip (hover desktop / tap mobile) */}
      {active && tooltipPos ? (
        <div
          className="fixed z-[60]"
          style={{ left: tooltipPos.left, top: tooltipPos.top, width: 320 }}
          role="dialog"
          aria-label="Vendor comparison tooltip"
        >
          <div className="rounded-2xl border border-foreground/15 bg-background/80 backdrop-blur p-4 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  {vendorList.find((v) => v.id === active.id)?.name ?? "Vendor"}
                </p>
                <p className="text-xs text-foreground/60 mt-1">
                  Atom strengths
                </p>
              </div>
              <button
                type="button"
                className="text-foreground/60 hover:text-foreground transition-colors"
                onClick={closeTooltip}
                aria-label="Close tooltip"
              >
                ×
              </button>
            </div>

            <ul className="mt-3 space-y-2 text-xs text-foreground/80">
              {ATOM_STRENGTH_BULLETS.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-[2px] size-[6px] rounded-full bg-secondary/80 flex-none" />
                  <span className="leading-snug">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                className="text-xs text-secondary/90 hover:text-secondary transition-colors"
                onClick={() => navigateToCompare(active.id, active.slug)}
              >
                Open full comparison →
              </button>
              {isCoarsePointer ? (
                <span className="text-[11px] text-foreground/50">
                  Tap to compare
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}


