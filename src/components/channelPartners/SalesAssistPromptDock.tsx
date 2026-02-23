"use client";

import { HiSparkles } from "react-icons/hi2";
import type { DiscoveryContext } from "./PartnerDiscoveryWizard";

interface SalesAssistPromptDockProps {
  context: DiscoveryContext;
  onPromptClick: (prompt: string) => void;
}

export default function SalesAssistPromptDock({
  context,
  onPromptClick,
}: SalesAssistPromptDockProps) {
  const competitorName = context.competitors[0] || "{competitor}";
  const priorities = context.customerPriorities.join(", ") || "{priorities}";

  const prompts = [
    {
      label: `Battlecard vs ${competitorName}`,
      prompt: `Give me a battlecard for selling Atom (Antimatter) against ${context.competitors.join(", ")}. Focus on: ${priorities}. Customer deployment needs: ${context.deploymentNeeds.join(", ")}.`,
      disabled: context.competitors.length === 0,
    },
    {
      label: "Follow-up Email",
      prompt: `Write a professional follow-up email after a discovery call with a ${context.buyerPersona || "prospect"}. They're evaluating ${context.competitors.join(" and ")} for ${context.useCase.category}. Their priorities are: ${priorities}. Deployment: ${context.deploymentNeeds.join(", ")}.`,
      disabled: context.competitors.length === 0,
    },
    {
      label: "Draft Proposal + SOW",
      prompt: `Draft a proposal and scope of work for Atom deployment. Use case: ${context.useCase.category} - ${context.useCase.details}. Competing against: ${context.competitors.join(", ")}. Customer priorities: ${priorities}. Deployment: ${context.deploymentNeeds.join(", ")}.`,
      disabled: !context.useCase.category,
    },
    {
      label: "Pricing Guidance",
      prompt: `Provide sample pricing ranges for an Atom deployment. Use case: ${context.useCase.category}. Deployment: ${context.deploymentNeeds.join(", ")}. Include assumptions and comparison to ${competitorName} pricing model.`,
      disabled: !context.useCase.category,
    },
    {
      label: "Qualification Questions",
      prompt: `What questions should I ask to qualify this deal? Persona: ${context.buyerPersona}. Use case: ${context.useCase.category}. They're considering ${context.competitors.join(", ")}.`,
      disabled: context.competitors.length === 0,
    },
    {
      label: `Why Antimatter Wins`,
      prompt: `Summarize why Atom (Antimatter) wins for: ${priorities}. Competing against: ${context.competitors.join(", ")}. Deployment needs: ${context.deploymentNeeds.join(", ")}.`,
      disabled: context.customerPriorities.length === 0,
    },
    {
      label: "Executive Comparison Table",
      prompt: `Create an executive-friendly comparison table: Atom vs ${context.competitors.join(" vs ")}. Focus on: ${priorities}. Format for easy copy/paste into proposal.`,
      disabled: context.competitors.length === 0,
    },
  ];

  return (
    <div className="border-t border-foreground/10 bg-background/50 backdrop-blur-sm">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <HiSparkles className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-medium">Quick Actions</h3>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {prompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onPromptClick(prompt.prompt)}
              disabled={prompt.disabled}
              className={`flex-shrink-0 px-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                prompt.disabled
                  ? "bg-foreground/5 text-foreground/30 cursor-not-allowed"
                  : "bg-accent/10 hover:bg-accent hover:text-black border border-accent/20 hover:border-accent"
              }`}
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
