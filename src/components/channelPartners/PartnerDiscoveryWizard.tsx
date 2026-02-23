"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { HiCheck, HiXMark } from "react-icons/hi2";

export type DiscoveryContext = {
  competitors: string[];
  customerPriorities: string[];
  deploymentNeeds: string[];
  useCase: { category?: string; details?: string };
  buyerPersona?: string;
};

interface PartnerDiscoveryWizardProps {
  vendors: Array<{ id: string; name: string }>;
  onChange: (context: DiscoveryContext) => void;
  onReset: () => void;
}

const steps = [
  { id: "competitors", title: "Who are you selling against?" },
  { id: "priorities", title: "Customer priorities" },
  { id: "deployment", title: "Deployment constraints" },
  { id: "useCase", title: "Use case" },
  { id: "persona", title: "Buyer persona" },
];

const priorityOptions = [
  "IP Ownership",
  "On-Prem Deployment",
  "Security & Compliance",
  "Cost Control",
  "Data Sovereignty",
  "Custom Workflows",
  "Voice Capabilities",
  "Enterprise Integrations",
  "Audit Trails",
  "Multi-Agent Orchestration",
];

const deploymentOptions = [
  "On-Prem Required",
  "VPC / Private Cloud",
  "Hybrid",
  "SaaS OK",
  "Data Residency Requirements",
  "Air-Gapped Environment",
  "Compliance (HIPAA/SOC2/FedRAMP)",
];

const useCaseOptions = [
  "Customer Support",
  "Sales Enablement",
  "Internal Operations",
  "Healthcare / RCM",
  "Security Operations",
  "Developer Tools",
  "Custom Application",
];

const personaOptions = [
  "CIO / CTO",
  "VP Engineering",
  "Director of Operations",
  "Security Lead",
  "RevOps / Sales Ops",
  "Customer Support Lead",
  "Product Manager",
];

export default function PartnerDiscoveryWizard({
  vendors,
  onChange,
  onReset,
}: PartnerDiscoveryWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [context, setContext] = useState<DiscoveryContext>({
    competitors: [],
    customerPriorities: [],
    deploymentNeeds: [],
    useCase: {},
    buyerPersona: undefined,
  });

  const updateContext = (updates: Partial<DiscoveryContext>) => {
    const newContext = { ...context, ...updates };
    setContext(newContext);
    onChange(newContext);
  };

  const toggleArrayItem = (
    key: keyof Pick<DiscoveryContext, "competitors" | "customerPriorities" | "deploymentNeeds">,
    value: string
  ) => {
    const current = context[key];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    updateContext({ [key]: updated });
  };

  const handleReset = () => {
    const resetContext = {
      competitors: [],
      customerPriorities: [],
      deploymentNeeds: [],
      useCase: {},
      buyerPersona: undefined,
    };
    setContext(resetContext);
    setCurrentStep(0);
    onReset();
  };

  const completedSteps = [
    context.competitors.length > 0,
    context.customerPriorities.length > 0,
    context.deploymentNeeds.length > 0,
    context.useCase.category || context.useCase.details,
    context.buyerPersona,
  ];

  return (
    <div className="bg-background border border-foreground/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Discovery</h2>
        <button
          onClick={handleReset}
          className="text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Progress indicators */}
      <div className="flex gap-2 mb-6">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`h-1 flex-1 rounded-full transition-colors ${
              completedSteps[idx]
                ? "bg-accent"
                : idx === currentStep
                ? "bg-accent/40"
                : "bg-foreground/10"
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="space-y-6">
        {/* Step 0: Competitors */}
        <div>
          <button
            onClick={() => setCurrentStep(0)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  completedSteps[0] ? "bg-accent text-black" : "bg-foreground/10"
                }`}
              >
                {completedSteps[0] ? <HiCheck className="w-4 h-4" /> : "1"}
              </div>
              <span className="font-medium">{steps[0]?.title}</span>
            </div>
            {context.competitors.length > 0 && (
              <span className="text-sm text-foreground/50">
                {context.competitors.length} selected
              </span>
            )}
          </button>
          {currentStep === 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4 ml-9 space-y-2"
            >
              <div className="flex flex-wrap gap-2">
                {vendors
                  .filter((v) => v.id !== "atom")
                  .map((vendor) => (
                    <button
                      key={vendor.id}
                      onClick={() => toggleArrayItem("competitors", vendor.name)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        context.competitors.includes(vendor.name)
                          ? "bg-accent text-black"
                          : "bg-foreground/5 hover:bg-foreground/10"
                      }`}
                    >
                      {vendor.name}
                    </button>
                  ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Step 1: Priorities */}
        <div>
          <button
            onClick={() => setCurrentStep(1)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  completedSteps[1] ? "bg-accent text-black" : "bg-foreground/10"
                }`}
              >
                {completedSteps[1] ? <HiCheck className="w-4 h-4" /> : "2"}
              </div>
              <span className="font-medium">{steps[1]?.title}</span>
            </div>
            {context.customerPriorities.length > 0 && (
              <span className="text-sm text-foreground/50">
                {context.customerPriorities.length} selected
              </span>
            )}
          </button>
          {currentStep === 1 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4 ml-9 space-y-2"
            >
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((priority) => (
                  <button
                    key={priority}
                    onClick={() => toggleArrayItem("customerPriorities", priority)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      context.customerPriorities.includes(priority)
                        ? "bg-accent text-black"
                        : "bg-foreground/5 hover:bg-foreground/10"
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Step 2: Deployment */}
        <div>
          <button
            onClick={() => setCurrentStep(2)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  completedSteps[2] ? "bg-accent text-black" : "bg-foreground/10"
                }`}
              >
                {completedSteps[2] ? <HiCheck className="w-4 h-4" /> : "3"}
              </div>
              <span className="font-medium">{steps[2]?.title}</span>
            </div>
            {context.deploymentNeeds.length > 0 && (
              <span className="text-sm text-foreground/50">
                {context.deploymentNeeds.length} selected
              </span>
            )}
          </button>
          {currentStep === 2 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4 ml-9 space-y-2"
            >
              <div className="flex flex-wrap gap-2">
                {deploymentOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleArrayItem("deploymentNeeds", option)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      context.deploymentNeeds.includes(option)
                        ? "bg-accent text-black"
                        : "bg-foreground/5 hover:bg-foreground/10"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Step 3: Use Case */}
        <div>
          <button
            onClick={() => setCurrentStep(3)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  completedSteps[3] ? "bg-accent text-black" : "bg-foreground/10"
                }`}
              >
                {completedSteps[3] ? <HiCheck className="w-4 h-4" /> : "4"}
              </div>
              <span className="font-medium">{steps[3]?.title}</span>
            </div>
            {context.useCase.category && (
              <span className="text-sm text-foreground/50">
                {context.useCase.category}
              </span>
            )}
          </button>
          {currentStep === 3 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4 ml-9 space-y-3"
            >
              <div className="flex flex-wrap gap-2">
                {useCaseOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      updateContext({
                        useCase: { ...context.useCase, category: option },
                      })
                    }
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      context.useCase.category === option
                        ? "bg-accent text-black"
                        : "bg-foreground/5 hover:bg-foreground/10"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Additional use case details..."
                value={context.useCase.details || ""}
                onChange={(e) =>
                  updateContext({
                    useCase: { ...context.useCase, details: e.target.value },
                  })
                }
                className="w-full bg-foreground/5 border border-foreground/10 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
                rows={3}
              />
            </motion.div>
          )}
        </div>

        {/* Step 4: Buyer Persona */}
        <div>
          <button
            onClick={() => setCurrentStep(4)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  completedSteps[4] ? "bg-accent text-black" : "bg-foreground/10"
                }`}
              >
                {completedSteps[4] ? <HiCheck className="w-4 h-4" /> : "5"}
              </div>
              <span className="font-medium">{steps[4]?.title}</span>
            </div>
            {context.buyerPersona && (
              <span className="text-sm text-foreground/50">
                {context.buyerPersona}
              </span>
            )}
          </button>
          {currentStep === 4 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4 ml-9 space-y-2"
            >
              <div className="flex flex-wrap gap-2">
                {personaOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => updateContext({ buyerPersona: option })}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      context.buyerPersona === option
                        ? "bg-accent text-black"
                        : "bg-foreground/5 hover:bg-foreground/10"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Summary */}
      {completedSteps.some((s) => s) && (
        <div className="mt-6 pt-6 border-t border-foreground/10">
          <h3 className="text-sm font-medium text-foreground/50 mb-3">Summary</h3>
          <div className="space-y-2 text-sm">
            {context.competitors.length > 0 && (
              <div>
                <span className="text-foreground/50">Competing against:</span>{" "}
                <span className="text-foreground">{context.competitors.join(", ")}</span>
              </div>
            )}
            {context.customerPriorities.length > 0 && (
              <div>
                <span className="text-foreground/50">Priorities:</span>{" "}
                <span className="text-foreground">
                  {context.customerPriorities.slice(0, 3).join(", ")}
                  {context.customerPriorities.length > 3 && ` +${context.customerPriorities.length - 3}`}
                </span>
              </div>
            )}
            {context.deploymentNeeds.length > 0 && (
              <div>
                <span className="text-foreground/50">Deployment:</span>{" "}
                <span className="text-foreground">
                  {context.deploymentNeeds.slice(0, 2).join(", ")}
                  {context.deploymentNeeds.length > 2 && ` +${context.deploymentNeeds.length - 2}`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
