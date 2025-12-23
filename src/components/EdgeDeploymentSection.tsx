"use client";

import Reveal from "./ui/Reveal";
import Button from "./ui/Button";
import TransitionLink from "./ui/TransitionLink";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Gauge, ShieldCheck, Network, type LucideIcon } from "lucide-react";
import dynamic from "next/dynamic";

const EdgeGlobe = dynamic(() => import("./enterprise/EdgeGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-[520px] xl:max-w-[600px] mx-auto aspect-square rounded-full border border-foreground/10 bg-foreground/[0.02]" />
  ),
});

type EdgePointRowProps = {
  icon: LucideIcon;
  text: string;
};

const EdgePointRow = ({ icon: Icon, text }: EdgePointRowProps) => {
  return (
    <div
      className={[
        "w-full flex items-center gap-4",
        "rounded-2xl px-6 py-4",
        // Keep border always to prevent layout shift on hover
        "border border-foreground/10 bg-transparent",
        "transition-colors transition-shadow",
        "md:hover:bg-foreground/[0.03] md:hover:border-foreground/15 md:hover:shadow-[0_0_0_1px_rgba(123,124,255,.22)]",
        "cursor-default",
      ].join(" ")}
    >
      <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.03]">
        <Icon className="w-5 h-5 text-secondary/80" strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base text-foreground/85 leading-snug">
          {text}
        </p>
      </div>
    </div>
  );
};

const EdgeDeploymentSection = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadGlobe, setShouldLoadGlobe] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio ?? 0;
        if (ratio >= 0.15) {
          setShouldLoadGlobe(true);
        }
      },
      {
        threshold: [0, 0.1, 0.2],
        // Preload earlier to avoid main-thread jank right as the user scrolls into the section.
        rootMargin: "320px 0px 320px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div ref={sectionRef} className="py-32 sm:py-40" id="edge-deployment-section">
      <div className="flex flex-col md:flex-row justify-between items-center gap-10 md:gap-16 lg:gap-20">
        {/* Left: 3D globe (lazy-loaded) */}
        <div className="relative w-full md:w-1/2 order-2 md:order-1">
          {shouldLoadGlobe ? <EdgeGlobe /> : <div className="w-full max-w-[520px] xl:max-w-[600px] mx-auto aspect-square rounded-full border border-foreground/10 bg-foreground/[0.02]" />}
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
            <div className="flex flex-col gap-4 mb-10">
              {[
                { icon: Gauge, text: "Lower round‑trip latency for voice and real‑time UX" },
                { icon: ShieldCheck, text: "Regional execution with data‑residency boundaries" },
                { icon: Network, text: "Hybrid routing: edge inference + VPC/on‑prem orchestration" },
              ].map((item) => (
                <EdgePointRow key={item.text} icon={item.icon} text={item.text} />
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

