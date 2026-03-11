import ClinixScrollSequence from "@/components/clinix/ClinixScrollSequence";
import { HowItWorks2 } from "@/components/clinix/how-it-works-2";
import ClinixCapabilities from "@/components/clinix/ClinixCapabilities";
import ClinixWorkflow from "@/components/clinix/ClinixWorkflow";
import ClinixOutcomes from "@/components/clinix/ClinixOutcomes";
import ClinixCTA from "@/components/clinix/ClinixCTA";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "Clinix AI — AI infrastructure for modern medical practices",
  description:
    "Clinix AI connects documentation, billing, revenue cycle management, and operational workflows into a unified intelligent system that helps practices reduce administrative burden and capture more revenue.",
  path: "/clinix",
});

export default function ClinixPage(): ReactNode {
  return (
    <main className="flex-1 min-h-screen w-full max-w-none bg-[#0b0b0c]">
      {/* Apple-style scroll-scrub: pinned full-screen animation + overlay copy */}
      <ClinixScrollSequence />
      {/* How It Works — ReactBits-style block */}
      <HowItWorks2 />
      <ClinixCapabilities />
      <ClinixWorkflow />
      <ClinixOutcomes />
      <ClinixCTA />
    </main>
  );
}
