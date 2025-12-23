"use client";

import { useEffect, useMemo, useState } from "react";
import TransitionLink from "./TransitionLink";
import Button from "./Button";

type CompareCtaLocation = "hero" | "framework" | "cards" | "edge" | "footer";

type CompareEnterpriseAICTAProps = {
  location: CompareCtaLocation;
  variant?: "primary" | "secondary" | "link";
  className?: string;
  showSubcopy?: boolean;
};

const DEST_PATH = "/resources/vendor-matrix";

function buildHrefWithUtm(destPath: string, search: string | null) {
  if (!search) return destPath;
  const utm = new URLSearchParams();
  new URLSearchParams(search).forEach((value, key) => {
    if (key.toLowerCase().startsWith("utm_")) utm.set(key, value);
  });
  const qs = utm.toString();
  return qs ? `${destPath}?${qs}` : destPath;
}

export default function CompareEnterpriseAICTA({
  location,
  variant = "secondary",
  className,
  showSubcopy,
}: CompareEnterpriseAICTAProps) {
  // Avoid useSearchParams() to keep /enterprise-ai statically prerenderable (no Suspense requirement).
  const [search, setSearch] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSearch(window.location.search || "");
  }, []);
  const href = useMemo(() => buildHrefWithUtm(DEST_PATH, search), [search]);

  if (variant === "link") {
    return (
      <TransitionLink
        href={href}
        data-cta="compare-enterprise-ai"
        data-cta-location={location}
        className={className ?? "text-sm text-foreground/75 hover:text-foreground transition-colors"}
      >
        <span className="inline-flex items-center gap-2">
          Compare Enterprise AI <span aria-hidden="true">→</span>
        </span>
      </TransitionLink>
    );
  }

  return (
    <div className={className}>
      <TransitionLink
        href={href}
        data-cta="compare-enterprise-ai"
        data-cta-location={location}
      >
        <Button variant={variant === "primary" ? "primary" : "inverted"}>
          <span className="px-8">Compare Enterprise AI</span>
        </Button>
      </TransitionLink>
      {showSubcopy ? (
        <p className="mt-2 text-xs text-foreground/60">
          See how Atom stacks up across deployment, security, and IP ownership.
        </p>
      ) : null}
    </div>
  );
}


