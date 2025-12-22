"use client";

import { Vendor } from "@/data/vendorMatrix";
import { useMemo } from "react";
import { HiShieldCheck, HiSparkles, HiServerStack, HiLink, HiMicrophone, HiCircleStack } from "react-icons/hi2";

interface SuggestedPromptsProps {
  vendors: Vendor[];
  onPromptClick: (prompt: string) => void;
}

export default function SuggestedPrompts({ vendors, onPromptClick }: SuggestedPromptsProps) {
  const prompts = useMemo(() => {
    const competitors = vendors.filter((v) => v.id !== "atom").slice(0, 2);
    const competitorNames = competitors.map((v) => v.name).join(" and ");

    return [
      {
        icon: HiShieldCheck,
        label: "Most secure",
        prompt: `Which of the selected vendors is most secure for a regulated enterprise? Focus on private deployment and IP ownership.`,
      },
      {
        icon: HiServerStack,
        label: "On-prem ready",
        prompt: `Compare on-premises deployment capabilities: Atom vs ${competitorNames || "competitors"}. Which supports air-gapped environments?`,
      },
      {
        icon: HiSparkles,
        label: "Best for GenUI",
        prompt: `Which vendors support GenUI (dynamic UI generation)? How does Atom's approach differ from ${competitorNames || "others"}?`,
      },
      {
        icon: HiMicrophone,
        label: "Voice agents",
        prompt: `Compare voice agent capabilities across selected vendors. Which support real-time voice-to-voice?`,
      },
      {
        icon: HiCircleStack,
        label: "RAG + Search",
        prompt: `How do RAG and enterprise search capabilities compare? Which vendors offer the most control?`,
      },
      {
        icon: HiLink,
        label: "Integrations",
        prompt: `Compare tool calling and integration capabilities. Which vendors offer the most flexibility?`,
      },
    ];
  }, [vendors]);

  return (
    <div className="flex flex-wrap gap-2">
      {prompts.slice(0, 6).map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={i}
            onClick={() => onPromptClick(item.prompt)}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-secondary/10 border border-secondary/30 text-secondary rounded-full hover:bg-secondary/20 transition-colors"
            title={item.prompt}
          >
            <Icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

