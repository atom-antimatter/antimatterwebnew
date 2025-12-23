"use client";

import Reveal from "./ui/Reveal";
import DottedWorldMap from "./ui/DottedWorldMap";
import Button from "./ui/Button";
import TransitionLink from "./ui/TransitionLink";
import { EDGE_LOCATIONS } from "@/data/edgeLocations";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Gauge, ShieldCheck, Network } from "lucide-react";

const EdgeDeploymentSection = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [mapMode, setMapMode] = useState<"full" | "edge">("full");
  const pathname = usePathname();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // More reliable than isIntersecting alone on fast scroll.
        const ratio = entry.intersectionRatio ?? 0;
        if (ratio >= 0.3) setMapMode("edge");
        else setMapMode("full");
      },
      {
        threshold: [0, 0.15, 0.3, 0.45],
        rootMargin: "0px 0px -25% 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div ref={sectionRef} className="py-32 sm:py-40" id="edge-deployment-section">
      <div className="flex flex-col md:flex-row justify-between items-center gap-10 md:gap-16 lg:gap-20">
        {/* Left: Animated map */}
        <div className="relative w-full md:w-1/2 order-2 md:order-1">
          <DottedWorldMap
            variant="enterpriseEdge"
            mode={mapMode}
            edgeLocations={EDGE_LOCATIONS}
            edgeLocationsLimit={8}
            activeRadiusPx={24}
          />
        </div>
        
        {/* Right: Content */}
        <div className="w-full md:w-1/2 order-1 md:order-2">
          <Reveal>
            <p className="text-sm uppercase tracking-wider text-foreground/60 mb-4">
              Edge Deployment
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6">
              Edge AI, Lower Latency
            </h2>
            <p className="text-base sm:text-lg text-foreground/80 mb-8 leading-relaxed">
              Place inference and orchestration closer to users without moving sensitive data. Keep regional control and route workloads across edge, VPC, and on‑prem.
            </p>
            
            {/* Key points */}
            <div className="flex flex-col gap-6 mb-10">
              {[
                {
                  icon: Gauge,
                  text: "Lower round‑trip latency for voice and real‑time UX",
                },
                {
                  icon: ShieldCheck,
                  text: "Regional execution with data‑residency boundaries",
                },
                {
                  icon: Network,
                  text: "Hybrid routing: edge inference + VPC/on‑prem orchestration",
                },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-start gap-4 rounded-xl border border-transparent px-2 py-2 -mx-2 transition-colors md:hover:border-foreground/10 md:hover:bg-foreground/[0.03]"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-background/20">
                    <Icon
                      className="h-5 w-5 text-secondary/80"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Partnership line */}
            <p className="text-xs sm:text-sm text-foreground/50 mb-8 italic">
              Powered by our edge partnership with Akamai + Linode.
            </p>
            
            {/* CTA */}
            <div className="flex">
              <TransitionLink href="/contact">
                <Button>
                  <span className="px-5">Explore Edge Deployment</span>
                </Button>
              </TransitionLink>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default EdgeDeploymentSection;

