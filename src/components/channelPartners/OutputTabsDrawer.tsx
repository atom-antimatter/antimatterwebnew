"use client";

import { useState } from "react";
import { HiClipboardDocument, HiArrowDownTray, HiCheck } from "react-icons/hi2";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface SalesOutputs {
  battlecard?: {
    summary: string;
    landmines?: string[];
    talkTracks?: string[];
    objectionHandles?: string[];
  };
  email?: {
    subject: string;
    body: string;
  };
  proposal?: {
    overview: string;
    scope?: string[];
    timeline?: string;
    assumptions?: string[];
    nextSteps?: string[];
  };
  pricing?: {
    tiers?: Array<{ name: string; range: string; includes: string[] }>;
    assumptions?: string[];
  };
  resources?: Array<{
    title: string;
    type: "internal" | "external";
    href: string;
    whyItMatters?: string;
  }>;
}

interface OutputTabsDrawerProps {
  outputs: SalesOutputs;
  isVisible: boolean;
}

const tabs = [
  { id: "battlecard", label: "Battlecard" },
  { id: "email", label: "Email" },
  { id: "proposal", label: "Proposal" },
  { id: "pricing", label: "Pricing" },
  { id: "resources", label: "Resources" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function OutputTabsDrawer({
  outputs,
  isVisible,
}: OutputTabsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("battlecard");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const content = getTabContent(activeTab);
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const content = getTabContent(activeTab);
    if (content) {
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab}-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getTabContent = (tab: TabId): string => {
    switch (tab) {
      case "battlecard":
        if (!outputs.battlecard) return "";
        const bc = outputs.battlecard;
        return `# Battlecard\n\n${bc.summary}\n\n${
          bc.landmines?.length
            ? `## Landmines\n${bc.landmines.map((l) => `- ${l}`).join("\n")}\n\n`
            : ""
        }${
          bc.talkTracks?.length
            ? `## Talk Tracks\n${bc.talkTracks.map((t) => `- ${t}`).join("\n")}\n\n`
            : ""
        }${
          bc.objectionHandles?.length
            ? `## Objection Handles\n${bc.objectionHandles.map((o) => `- ${o}`).join("\n")}`
            : ""
        }`;

      case "email":
        if (!outputs.email) return "";
        return `Subject: ${outputs.email.subject}\n\n${outputs.email.body}`;

      case "proposal":
        if (!outputs.proposal) return "";
        const prop = outputs.proposal;
        return `# Proposal\n\n${prop.overview}\n\n${
          prop.scope?.length
            ? `## Scope\n${prop.scope.map((s) => `- ${s}`).join("\n")}\n\n`
            : ""
        }${prop.timeline ? `## Timeline\n${prop.timeline}\n\n` : ""}${
          prop.assumptions?.length
            ? `## Assumptions\n${prop.assumptions.map((a) => `- ${a}`).join("\n")}\n\n`
            : ""
        }${
          prop.nextSteps?.length
            ? `## Next Steps\n${prop.nextSteps.map((n) => `- ${n}`).join("\n")}`
            : ""
        }`;

      case "pricing":
        if (!outputs.pricing) return "";
        const pricing = outputs.pricing;
        return `# Pricing\n\n${
          pricing.tiers?.length
            ? pricing.tiers
                .map(
                  (tier) =>
                    `## ${tier.name}\n**Range:** ${tier.range}\n\n**Includes:**\n${tier.includes
                      .map((i) => `- ${i}`)
                      .join("\n")}`
                )
                .join("\n\n")
            : ""
        }\n\n${
          pricing.assumptions?.length
            ? `## Assumptions\n${pricing.assumptions.map((a) => `- ${a}`).join("\n")}`
            : ""
        }`;

      case "resources":
        if (!outputs.resources?.length) return "";
        return `# Recommended Resources\n\n${outputs.resources
          .map(
            (r) =>
              `## ${r.title}\n**Type:** ${r.type}\n**Link:** ${r.href}${
                r.whyItMatters ? `\n**Why it matters:** ${r.whyItMatters}` : ""
              }`
          )
          .join("\n\n")}`;

      default:
        return "";
    }
  };

  const hasContent = (tab: TabId): boolean => {
    return getTabContent(tab).length > 0;
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-foreground/5 border border-foreground/10 rounded-xl overflow-hidden"
    >
      {/* Tabs */}
      <div className="flex border-b border-foreground/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={!hasContent(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-accent text-foreground"
                : hasContent(tab.id)
                ? "text-foreground/50 hover:text-foreground"
                : "text-foreground/20 cursor-not-allowed"
            }`}
          >
            {tab.label}
            {hasContent(tab.id) && activeTab !== tab.id && (
              <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {hasContent(activeTab) ? (
          <>
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-foreground/5 hover:bg-foreground/10 rounded-md transition-colors"
              >
                {copied ? (
                  <>
                    <HiCheck className="w-4 h-4 text-green-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <HiClipboardDocument className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-foreground/5 hover:bg-foreground/10 rounded-md transition-colors"
              >
                <HiArrowDownTray className="w-4 h-4" />
                <span>Download .md</span>
              </button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {getTabContent(activeTab)}
              </ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-foreground/50">
            <p>No content generated yet.</p>
            <p className="text-sm mt-2">
              Use the quick actions above or ask a question in the chat.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
