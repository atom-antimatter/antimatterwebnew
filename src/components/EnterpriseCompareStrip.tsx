"use client";

import { vendors as vendorMatrixVendors, type Vendor } from "@/data/vendorMatrix";
import Link from "next/link";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./EnterpriseCompareStrip.module.css";
import VendorLogo from "@/components/vendorMatrix/VendorLogo";
import Button from "@/components/ui/Button";
import TransitionLink from "@/components/ui/TransitionLink";

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
  "Model-agnostic runtime + BYO embeddings",
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

function buildCompareHref(vendorId: string, filters: string | null) {
  const base = "/resources/vendor-matrix";
  const params = new URLSearchParams();
  params.set("vendors", vendorId === "atom" ? "atom" : `atom,${vendorId}`);
  if (filters) params.set("filters", filters);
  return `${base}?${params.toString()}`;
}

export default function EnterpriseCompareStrip() {
  const [active, setActive] = useState<{ id: string; slug: VendorSlug; name: string } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [filtersParam, setFiltersParam] = useState<string | null>(null);
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(pointer: coarse)");
    const update = () => setIsCoarsePointer(Boolean(mq?.matches));
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);

  // Optionally preserve active capability filters if present in the current URL.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const filters = sp.get("filters");
    setFiltersParam(filters);
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
    (v: { id: string; slug: VendorSlug; name: string }, el: HTMLButtonElement) => {
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

  const openMatrixHref = useMemo(() => buildCompareHref("atom", filtersParam), [filtersParam]);

  return (
    <section aria-label="Compare Enterprise AI" className="w-full">
      <div className="rounded-2xl border border-foreground/15 bg-background/20 backdrop-blur px-6 sm:px-8 py-8">
        <p className="text-xs tracking-widest uppercase text-foreground/60">COMPARE</p>
        <div className="mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold">Compare Enterprise AI Solutions</h2>
            <p className="mt-2 text-sm text-foreground/70 max-w-[70ch]">
              See how Atom stacks up on security, IP ownership, deployment, and real-time UX.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <TransitionLink href={openMatrixHref}>
              <Button>
                <span className="px-8">Open Comparison Matrix</span>
              </Button>
            </TransitionLink>
            <Link
              href={openMatrixHref}
              className="text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              Select vendors to compare
            </Link>
          </div>
        </div>

        {/* Desktop grid */}
        <div className="mt-8 hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {vendorList
            .filter((v) => v.id !== "atom")
            .map((v) => {
              const href = buildCompareHref(v.id, filtersParam);
              return (
                <motion.div
                  key={v.id}
                  className="relative"
                  onMouseEnter={() => {
                    // Tooltip is positioned by the button element handlers below
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    type="button"
                    className={`
                      relative w-full p-5 rounded-xl border-2 transition-all
                      bg-zinc-900/50 hover:bg-zinc-900/70
                      border-zinc-800 hover:border-secondary
                      cursor-pointer
                    `}
                    onMouseEnter={(e) => openTooltip({ id: v.id, slug: v.slug, name: v.name }, e.currentTarget)}
                    onMouseLeave={() => closeTooltip()}
                    onFocus={(e) => openTooltip({ id: v.id, slug: v.slug, name: v.name }, e.currentTarget)}
                    onBlur={() => closeTooltip()}
                    onClick={() => {
                      trackClick(v.slug);
                      window.location.href = href;
                    }}
                    aria-label={`Compare Atom vs ${v.name}`}
                  >
                    <div className="flex items-center justify-center h-14 mb-3">
                      <VendorLogo vendor={v} size="lg" />
                    </div>
                    <p className="text-xs text-foreground/70 text-center">{v.name}</p>
                  </button>
                </motion.div>
              );
            })}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="mt-6 sm:hidden">
          <div
            className={`overflow-x-auto overflow-y-hidden scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${styles.mobileScroller}`}
          >
            <div className="flex gap-3 pr-8">
              {vendorList
                .filter((v) => v.id !== "atom")
                .map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={[
                      "flex-none w-[190px] rounded-xl border-2 border-zinc-800 bg-zinc-900/50",
                      "px-4 py-4 transition-all active:border-secondary active:bg-zinc-900/70",
                      "focus:outline-none focus:ring-2 focus:ring-secondary/60 focus:ring-offset-2 focus:ring-offset-background",
                    ].join(" ")}
                    onClick={(e) => {
                      // On mobile, first tap opens tooltip; comparison is via tooltip CTA.
                      e.preventDefault();
                      openTooltip({ id: v.id, slug: v.slug, name: v.name }, e.currentTarget);
                    }}
                    aria-label={`Open details for ${v.name}`}
                  >
                    <div className="flex items-center justify-center h-12 mb-2">
                      <VendorLogo vendor={v} size="md" />
                    </div>
                    <p className="text-xs text-foreground/70 text-center">{v.name}</p>
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-lg bg-zinc-900 border border-zinc-700 p-3 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Why Atom vs {active.name}
                </p>
                <p className="text-xs text-foreground/60 mt-1">Quick strengths</p>
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
                className="text-xs text-secondary hover:text-secondary/80 underline"
                onClick={() => {
                  const href = buildCompareHref(active.id, filtersParam);
                  trackClick(active.slug);
                  window.location.href = href;
                }}
              >
                Open full comparison →
              </button>
              {isCoarsePointer ? (
                <span className="text-[11px] text-foreground/50">
                  Tap to compare
                </span>
              ) : null}
            </div>
          </motion.div>
        </div>
      ) : null}
    </section>
  );
}


