"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { HiCheck } from "react-icons/hi2";

export type IntentIQContext = {
  industry: string;
  companySize: string;
  priorities: string[];
  currentTools: string;
  timeline: string;
};

interface IntentIQDiscoveryProps {
  context: IntentIQContext;
  onChange: (context: IntentIQContext) => void;
}

const steps = [
  { id: "industry", title: "Industry / Vertical" },
  { id: "companySize", title: "Company size" },
  { id: "priorities", title: "Buyer priorities" },
  { id: "currentTools", title: "Current tools" },
  { id: "timeline", title: "Timeline" },
];

const industryOptions = [
  "Healthcare / RCM",
  "Financial Services",
  "Biotech / Pharma",
  "SaaS / Technology",
  "Security / Defense",
  "Manufacturing",
  "Retail / E-Commerce",
  "Professional Services",
];

const companySizeOptions = [
  "Startup (1-50)",
  "SMB (51-500)",
  "Mid-Market (501-5K)",
  "Enterprise (5K+)",
  "Public Sector",
];

const priorityOptions = [
  "Data Security & Privacy",
  "On-Prem Deployment",
  "IP Ownership",
  "Compliance (HIPAA/SOC2)",
  "Cost Reduction",
  "Workflow Automation",
  "Voice AI",
  "Custom Integrations",
  "Audit & Traceability",
  "Model Flexibility",
];

const timelineOptions = [
  "Exploring (no timeline)",
  "This quarter",
  "Next 6 months",
  "Within 30 days",
  "Active RFP",
];

export default function IntentIQDiscovery({
  context,
  onChange,
}: IntentIQDiscoveryProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const update = (updates: Partial<IntentIQContext>) => {
    onChange({ ...context, ...updates });
  };

  const togglePriority = (value: string) => {
    const updated = context.priorities.includes(value)
      ? context.priorities.filter((p) => p !== value)
      : [...context.priorities, value];
    update({ priorities: updated });
  };

  const completedSteps = [
    !!context.industry,
    !!context.companySize,
    context.priorities.length > 0,
    !!context.currentTools,
    !!context.timeline,
  ];

  return (
    <div className="bg-background border border-foreground/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Discovery</h2>
        <button
          onClick={() =>
            onChange({
              industry: "",
              companySize: "",
              priorities: [],
              currentTools: "",
              timeline: "",
            })
          }
          className="text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Progress */}
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

      <div className="space-y-5">
        {/* Step 0: Industry */}
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
              <span className="font-medium text-sm">{steps[0]?.title}</span>
            </div>
            {context.industry && (
              <span className="text-xs text-foreground/50">{context.industry}</span>
            )}
          </button>
          {currentStep === 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-3 ml-9 flex flex-wrap gap-2"
            >
              {industryOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => update({ industry: opt })}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    context.industry === opt
                      ? "bg-accent text-black"
                      : "bg-foreground/5 hover:bg-foreground/10"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Step 1: Company Size */}
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
              <span className="font-medium text-sm">{steps[1]?.title}</span>
            </div>
            {context.companySize && (
              <span className="text-xs text-foreground/50">{context.companySize}</span>
            )}
          </button>
          {currentStep === 1 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-3 ml-9 flex flex-wrap gap-2"
            >
              {companySizeOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => update({ companySize: opt })}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    context.companySize === opt
                      ? "bg-accent text-black"
                      : "bg-foreground/5 hover:bg-foreground/10"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Step 2: Priorities */}
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
              <span className="font-medium text-sm">{steps[2]?.title}</span>
            </div>
            {context.priorities.length > 0 && (
              <span className="text-xs text-foreground/50">
                {context.priorities.length} selected
              </span>
            )}
          </button>
          {currentStep === 2 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-3 ml-9 flex flex-wrap gap-2"
            >
              {priorityOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => togglePriority(opt)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    context.priorities.includes(opt)
                      ? "bg-accent text-black"
                      : "bg-foreground/5 hover:bg-foreground/10"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Step 3: Current Tools */}
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
              <span className="font-medium text-sm">{steps[3]?.title}</span>
            </div>
          </button>
          {currentStep === 3 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-3 ml-9"
            >
              <textarea
                placeholder="What tools is the buyer currently using?"
                value={context.currentTools}
                onChange={(e) => update({ currentTools: e.target.value })}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
                rows={3}
              />
            </motion.div>
          )}
        </div>

        {/* Step 4: Timeline */}
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
              <span className="font-medium text-sm">{steps[4]?.title}</span>
            </div>
            {context.timeline && (
              <span className="text-xs text-foreground/50">{context.timeline}</span>
            )}
          </button>
          {currentStep === 4 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-3 ml-9 flex flex-wrap gap-2"
            >
              {timelineOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => update({ timeline: opt })}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    context.timeline === opt
                      ? "bg-accent text-black"
                      : "bg-foreground/5 hover:bg-foreground/10"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
