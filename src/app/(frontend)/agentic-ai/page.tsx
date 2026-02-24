import { FAQ } from "@/components/agentic/FAQ";
import { Features } from "@/components/agentic/Features";
import { FinalCTA } from "@/components/agentic/FinalCTA";
import { Hero } from "@/components/agentic/Hero";
import { HowItWorks } from "@/components/agentic/HowItWorks";
import { Pricing } from "@/components/agentic/Pricing";
import { Stats } from "@/components/agentic/Stats";
import { Testimonials } from "@/components/agentic/Testimonials";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import type { ReactNode } from "react";
import TransitionContainer from "@/components/ui/TransitionContainer";

export const metadata: Metadata = createMetadata({
  title: "Atom Agentic — Autonomous AI Agents for Workflows",
  description: "Transform Grok, Claude, and ChatGPT from brains into governed, auditable digital workers wired into your phones, EHRs, CRMs, billing systems, and mission-critical SaaS.",
  path: "/agentic-ai",
});

export default function AgenticAIPage(): ReactNode {
  return (
    <TransitionContainer initial={100} exit={-400}>
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Stats />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
    </TransitionContainer>
  );
}
