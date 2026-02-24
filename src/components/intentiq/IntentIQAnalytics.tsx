"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";

export interface IntentIQData {
  sentiment_score: number;
  intent_score: number;
  buyer_stage: string;
  topics: string[];
  urgency_level: string;
  recommended_next_actions: string[];
  follow_up_email: string;
  proposal_outline: string;
  suggested_pricing_range: string;
}

interface IntentIQAnalyticsProps {
  data: IntentIQData | null;
}

const MetricCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className="bg-gradient-to-br from-foreground/5 to-foreground/10 backdrop-blur-sm border border-foreground/10 rounded-xl p-6 hover:border-foreground/20 transition-colors">
    <div className="text-sm text-foreground/50 mb-2">{label}</div>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
  </div>
);

const ExpandableSection = ({
  title,
  content,
  defaultOpen = false,
}: {
  title: string;
  content: string;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-gradient-to-br from-foreground/5 to-foreground/10 backdrop-blur-sm border border-foreground/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-foreground/5 transition-colors"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        {isOpen ? (
          <HiChevronUp className="w-5 h-5 text-foreground/50" />
        ) : (
          <HiChevronDown className="w-5 h-5 text-foreground/50" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <pre className="whitespace-pre-wrap text-sm text-foreground/70 leading-relaxed font-sans">
                {content}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function IntentIQAnalytics({ data }: IntentIQAnalyticsProps) {
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-3">Buyer Intent Analytics</h2>
          <p className="text-foreground/50">
            Start a conversation to see real-time intent scoring
          </p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Decision":
        return "text-green-500";
      case "Shortlist":
        return "text-yellow-500";
      case "Evaluation":
        return "text-blue-500";
      default:
        return "text-foreground/50";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High":
        return "text-red-500";
      case "Medium":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-4">Buyer Intent Analytics</h2>
        <p className="text-foreground/50 text-sm">
          Real-time AI-powered analysis of conversation signals
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="Sentiment Score"
          value={`${data.sentiment_score}%`}
          color={getScoreColor(data.sentiment_score)}
        />
        <MetricCard
          label="Intent Score"
          value={`${data.intent_score}%`}
          color={getScoreColor(data.intent_score)}
        />
        <MetricCard
          label="Buyer Stage"
          value={data.buyer_stage}
          color={getStageColor(data.buyer_stage)}
        />
        <MetricCard
          label="Urgency"
          value={data.urgency_level}
          color={getUrgencyColor(data.urgency_level)}
        />
      </div>

      {/* Topics */}
      {data.topics.length > 0 && (
        <div className="bg-gradient-to-br from-foreground/5 to-foreground/10 backdrop-blur-sm border border-foreground/10 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground/50 mb-3">
            Key Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.topics.map((topic, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-accent/20 border border-accent/30 text-accent text-sm rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {data.recommended_next_actions.length > 0 && (
        <div className="bg-gradient-to-br from-foreground/5 to-foreground/10 backdrop-blur-sm border border-foreground/10 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground/50 mb-3">
            Recommended Next Actions
          </h3>
          <ul className="space-y-2">
            {data.recommended_next_actions.map((action, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-foreground/70"
              >
                <span className="text-accent mt-0.5">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expandable Sections */}
      {data.follow_up_email && (
        <ExpandableSection
          title="Generated Follow-Up Email"
          content={data.follow_up_email}
        />
      )}

      {data.proposal_outline && (
        <ExpandableSection
          title="Proposal Outline"
          content={data.proposal_outline}
        />
      )}

      {data.suggested_pricing_range && (
        <ExpandableSection
          title="Suggested Pricing Range"
          content={data.suggested_pricing_range}
        />
      )}
    </motion.div>
  );
}
