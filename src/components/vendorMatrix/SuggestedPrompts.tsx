"use client";

import { Vendor } from "@/data/vendorMatrix";
import { useMemo } from "react";

interface SuggestedPromptsProps {
  vendors: Vendor[];
  onPromptClick: (prompt: string) => void;
}

export default function SuggestedPrompts({ vendors, onPromptClick }: SuggestedPromptsProps) {
  const prompts = useMemo(() => {
    const competitors = vendors.filter((v) => v.id !== "atom").slice(0, 2);
    const competitorNames = competitors.map((v) => v.name);

    if (competitorNames.length === 0) {
      return [
        "What deployment models does Atom support and why does ownership matter?",
        "How does Atom handle security and compliance requirements?",
        "What's the difference between GenUI and traditional agent UIs?",
      ];
    }

    if (competitorNames.length === 1) {
      return [
        `Compare Atom vs ${competitorNames[0]} for private deployment and IP ownership`,
        `If we need on-prem + voice capabilities, which vendor fits best?`,
        `What are the security tradeoffs between Atom and ${competitorNames[0]}?`,
      ];
    }

    return [
      `Compare Atom vs ${competitorNames[0]} vs ${competitorNames[1]} for private deployment`,
      `If we need on-prem + voice, which of these 3 vendors fits best?`,
      `What are the key IP ownership differences between ${competitorNames.join(" and ")}?`,
    ];
  }, [vendors]);

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {prompts.map((prompt, i) => (
        <button
          key={i}
          onClick={() => onPromptClick(prompt)}
          className="text-xs px-3 py-1.5 bg-secondary/10 border border-secondary/30 text-secondary rounded-full hover:bg-secondary/20 transition-colors"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

