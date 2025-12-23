"use client";

import { vendors as vendorMatrixVendors, type Vendor } from "@/data/vendorMatrix";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
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

function CompareTile({
  vendor,
  filtersParam,
}: {
  vendor: Vendor & { slug: VendorSlug };
  filtersParam: string | null;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const href = useMemo(() => buildCompareHref(vendor.id, filtersParam), [vendor.id, filtersParam]);

  return (
    <motion.div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Tooltip (match vendor-matrix style: anchored, pointer-events-none, no flicker) */}
      {showTooltip ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 pointer-events-none"
        >
          <div className="text-xs space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Why Atom vs {vendor.name}
            </p>
            <ul className="space-y-1.5 text-foreground/80">
              {ATOM_STRENGTH_BULLETS.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-[3px] size-[6px] rounded-full bg-secondary/80 flex-none" />
                  <span className="leading-snug">{b}</span>
                </li>
              ))}
            </ul>
            <p className="text-secondary underline">Open full comparison →</p>
          </div>
        </motion.div>
      ) : null}

      <Link
        href={href}
        className={`
          relative block w-full p-5 rounded-xl border-2 transition-all
          bg-zinc-900/50 hover:bg-zinc-900/70
          border-zinc-800 hover:border-secondary
          cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-secondary/60 focus:ring-offset-2 focus:ring-offset-background
        `}
        aria-label={`Compare Atom vs ${vendor.name}`}
        onClick={() => trackClick(vendor.slug)}
      >
        <div className="flex items-center justify-center h-14 mb-3">
          <VendorLogo vendor={vendor} size="lg" />
        </div>
        <p className="text-xs text-foreground/70 text-center">{vendor.name}</p>
      </Link>
    </motion.div>
  );
}

export default function EnterpriseCompareStrip() {
  const [filtersParam, setFiltersParam] = useState<string | null>(null);

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
            .map((v) => (
              <CompareTile key={v.id} vendor={v} filtersParam={filtersParam} />
            ))}
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
                  <Link
                    key={v.id}
                    href={buildCompareHref(v.id, filtersParam)}
                    className={[
                      "flex-none w-[190px] rounded-xl border-2 border-zinc-800 bg-zinc-900/50",
                      "px-4 py-4 transition-all active:border-secondary active:bg-zinc-900/70",
                      "focus:outline-none focus:ring-2 focus:ring-secondary/60 focus:ring-offset-2 focus:ring-offset-background",
                      "block",
                    ].join(" ")}
                    onClick={() => trackClick(v.slug)}
                    aria-label={`Open details for ${v.name}`}
                  >
                    <div className="flex items-center justify-center h-12 mb-2">
                      <VendorLogo vendor={v} size="md" />
                    </div>
                    <p className="text-xs text-foreground/70 text-center">{v.name}</p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


