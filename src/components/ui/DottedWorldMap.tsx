"use client";

import { MotionDiv } from "@/components/Motion";
import { EDGE_LOCATIONS, type EdgeLocation } from "@/data/edgeLocations";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface DottedWorldMapProps {
  variant?: "company" | "enterpriseEdge";
  mode?: "full" | "edge";
  edgeLocations?: readonly EdgeLocation[];
  edgeLocationsLimit?: number;
  activeRadiusPx?: number;
  className?: string;
}

/**
 * Reusable dotted world-map component with animation variants
 * 
 * - "company" variant: Purple accent shrinks to reveal grey base (normal)
 * - "enterpriseEdge" variant: Starts all purple, settles to grey with purple accent (reversed)
 */
const SVG_VIEWBOX = { width: 639, height: 470 } as const;
const PURPLE_HEX = "#696AAC";

const svgTextCache = new Map<string, Promise<string>>();
const getSvgText = async (url: string) => {
  const existing = svgTextCache.get(url);
  if (existing) return existing;

  const p = fetch(url).then(async (res) => {
    if (!res.ok) {
      throw new Error(`Failed to load SVG: ${url} (${res.status})`);
    }
    return res.text();
  });
  svgTextCache.set(url, p);
  return p;
};

const lonLatToSvgXY = (lat: number, lon: number) => {
  // Equirectangular projection into the SVG viewBox coordinate space
  const x = ((lon + 180) / 360) * SVG_VIEWBOX.width;
  const y = ((90 - lat) / 180) * SVG_VIEWBOX.height;
  return { x, y };
};

const DottedWorldMap = ({
  variant = "company",
  mode = "full",
  edgeLocations = EDGE_LOCATIONS,
  edgeLocationsLimit = 8,
  activeRadiusPx = 24,
  className = "",
}: DottedWorldMapProps) => {
  const isEnterpriseEdge = variant === "enterpriseEdge";
  
  // Company: clipPath shrinks from 100% to 0% (purple disappears to reveal grey)
  // EnterpriseEdge: clipPath grows from 0% to ~85% (grey appears over purple, leaving purple accent)
  const initialClipPath = isEnterpriseEdge 
    ? "circle(0% at 48% 73%)"     // Start: No grey visible (all purple)
    : "circle(100% at 48% 73%)";   // Start: Purple fully visible
  
  const finalClipPath = isEnterpriseEdge
    ? "circle(85% at 48% 73%)"     // End: Grey covers most, purple accent remains
    : "circle(0% at 48% 73%)";     // End: Purple accent only

  // EnterpriseEdge mode uses inline SVG + dot filtering (so we can fade to edge regions only).
  // Company variant remains the original image-based implementation.
  const svgContainerRef = useRef<HTMLDivElement | null>(null);
  const dotPathsRef = useRef<SVGPathElement[]>([]);
  const dotCentersRef = useRef<Array<{ x: number; y: number }>>([]);
  const [enterpriseSvgMarkup, setEnterpriseSvgMarkup] = useState<string>("");

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  const effectiveEdgeLocations = useMemo(
    () => edgeLocations.slice(0, edgeLocationsLimit),
    [edgeLocations, edgeLocationsLimit]
  );

  const edgePointsSvg = useMemo(
    () => effectiveEdgeLocations.map((p) => lonLatToSvgXY(p.lat, p.lon)),
    [effectiveEdgeLocations]
  );

  useEffect(() => {
    if (!isEnterpriseEdge) return;
    let cancelled = false;

    // Use the purple SVG as the "full" state for enterprise edge (matches prior default look).
    getSvgText("/images/dotted-world-map-atlanta_accent.svg")
      .then((text) => {
        if (cancelled) return;
        setEnterpriseSvgMarkup(text);
      })
      .catch(() => {
        // If fetch fails for any reason, do nothing; the map will just not render.
      });

    return () => {
      cancelled = true;
    };
  }, [isEnterpriseEdge]);

  useEffect(() => {
    if (!isEnterpriseEdge) return;
    if (!enterpriseSvgMarkup) return;
    const container = svgContainerRef.current;
    if (!container) return;

    const svg = container.querySelector("svg");
    if (!svg) return;

    const paths = Array.from(svg.querySelectorAll("path")) as SVGPathElement[];
    dotPathsRef.current = paths;

    // Precompute dot centers once using bbox centers (stable + fast enough at mount time).
    dotCentersRef.current = paths.map((p) => {
      const b = p.getBBox();
      const x = b.x + b.width / 2;
      const y = b.y + b.height / 2;
      // Ensure transforms behave per-dot
      p.style.transformBox = "fill-box";
      p.style.transformOrigin = "center";
      return { x, y };
    });
  }, [enterpriseSvgMarkup, isEnterpriseEdge]);

  useEffect(() => {
    if (!isEnterpriseEdge) return;
    const paths = dotPathsRef.current;
    const centers = dotCentersRef.current;
    if (!paths.length || !centers.length) return;

    const r = activeRadiusPx;
    const r2 = r * r;
    const duration = prefersReducedMotion ? "0ms" : "650ms";

    for (let i = 0; i < paths.length; i++) {
      const el = paths[i];
      const c = centers[i];

      el.style.transitionProperty = "opacity, transform, filter";
      el.style.transitionTimingFunction = "ease";
      el.style.transitionDuration = duration;

      if (mode === "full") {
        el.style.opacity = "1";
        el.style.transform = "scale(1)";
        el.style.filter = "none";
        // Keep original purple fill from the accent SVG
        el.setAttribute("fill", PURPLE_HEX);
        continue;
      }

      // mode === "edge"
      let minDist2 = Number.POSITIVE_INFINITY;
      for (let j = 0; j < edgePointsSvg.length; j++) {
        const p = edgePointsSvg[j];
        const dx = c.x - p.x;
        const dy = c.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < minDist2) minDist2 = d2;
        if (minDist2 <= r2) break;
      }

      const isActive = minDist2 <= r2;
      if (isActive) {
        el.style.opacity = "1";
        el.style.transform = prefersReducedMotion ? "scale(1)" : "scale(1.18)";
        el.setAttribute("fill", PURPLE_HEX);
        el.style.filter = "drop-shadow(0 0 6px rgba(105,106,172,0.8))";
      } else {
        el.style.opacity = "0";
        el.style.transform = "scale(0.9)";
        el.style.filter = "none";
      }
    }
  }, [activeRadiusPx, edgePointsSvg, isEnterpriseEdge, mode, prefersReducedMotion]);

  if (isEnterpriseEdge) {
    return (
      <div
        className={`relative ${className} max-w-[500px] xl:max-w-[639px] w-full [&_svg]:w-full [&_svg]:h-auto`}
        aria-label="World map"
      >
        <div
          ref={svgContainerRef}
          className="w-full"
          dangerouslySetInnerHTML={{ __html: enterpriseSvgMarkup }}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Base layer: Grey world map */}
      <Image
        src="/images/dotted-world-map-atlanta.svg"
        alt="World map"
        width={639}
        height={470}
        quality={100}
        className="max-w-[500px] xl:max-w-[639px] w-full"
      />

      {/* Animated overlay layer */}
      <MotionDiv
        initial={{ clipPath: initialClipPath }}
        whileInView={{ clipPath: finalClipPath }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        viewport={{ once: true, amount: 0.8, margin: "30px" }}
        className="absolute top-0 left-0 w-full h-full"
      >
        <Image
          src="/images/dotted-world-map-atlanta_accent.svg"
          alt="World map accent"
          width={639}
          height={470}
          quality={100}
          className="max-w-[500px] xl:max-w-[639px] w-full"
        />
      </MotionDiv>
    </div>
  );
};

export default DottedWorldMap;

