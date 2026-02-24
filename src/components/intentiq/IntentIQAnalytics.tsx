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

function ScoreRing({
  label,
  value,
  subtitle,
  color,
}: {
  label: string;
  value: number;
  subtitle: string;
  color: string;
}) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-5 flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-foreground/10"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            className={color}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold leading-none">{value}</span>
          <span className="text-[10px] text-foreground/40">/100</span>
        </div>
      </div>
      <div>
        <div className="text-xs text-foreground/40 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-sm text-foreground/70 mt-0.5">{subtitle}</div>
      </div>
    </div>
  );
}

function ExpandableSection({
  title,
  content,
  defaultOpen = false,
}: {
  title: string;
  content: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-foreground/5 transition-colors text-left"
      >
        <h3 className="text-sm font-semibold">{title}</h3>
        {isOpen ? (
          <HiChevronUp className="w-4 h-4 text-foreground/40 shrink-0" />
        ) : (
          <HiChevronDown className="w-4 h-4 text-foreground/40 shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">
              <pre className="whitespace-pre-wrap text-xs text-foreground/60 leading-relaxed font-sans">
                {content}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IntentIQAnalytics({ data }: IntentIQAnalyticsProps) {
  const getSentimentLabel = (score: number) => {
    if (score >= 75) return "Positive";
    if (score >= 50) return "Neutral";
    if (score >= 25) return "Cautious";
    return "Negative";
  };

  const getIntentLabel = (score: number) => {
    if (score >= 75) return "High";
    if (score >= 50) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-4">
      {/* Section header — Akamai style */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">📊</span>
        <h2 className="text-base font-semibold">Admin Analytics</h2>
      </div>

      {/* Score rings row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
        <ScoreRing
          label="Sentiment"
          value={data?.sentiment_score ?? 50}
          subtitle={data ? getSentimentLabel(data.sentiment_score) : "Neutral"}
          color={
            (data?.sentiment_score ?? 50) >= 60
              ? "text-green-500"
              : "text-yellow-500"
          }
        />
        <ScoreRing
          label="Buyer Intent"
          value={data?.intent_score ?? 0}
          subtitle={data ? getIntentLabel(data.intent_score) : "Low"}
          color={
            (data?.intent_score ?? 0) >= 60
              ? "text-accent"
              : "text-foreground/40"
          }
        />
      </div>

      {/* Buyer stage + urgency row */}
      {data && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl px-5 py-4">
            <div className="text-xs text-foreground/40 uppercase tracking-wider mb-1">
              Buyer Stage
            </div>
            <div className="text-sm font-semibold">{data.buyer_stage}</div>
          </div>
          <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl px-5 py-4">
            <div className="text-xs text-foreground/40 uppercase tracking-wider mb-1">
              Urgency
            </div>
            <div
              className={`text-sm font-semibold ${
                data.urgency_level === "High"
                  ? "text-red-400"
                  : data.urgency_level === "Medium"
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {data.urgency_level}
            </div>
          </div>
        </div>
      )}

      {/* Topics */}
      {data && data.topics.length > 0 && (
        <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl px-5 py-4">
          <div className="text-xs text-foreground/40 uppercase tracking-wider mb-2">
            Topics Discussed
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.topics.map((topic, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-accent/15 text-accent text-xs rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended actions */}
      {data && data.recommended_next_actions.length > 0 && (
        <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl px-5 py-4">
          <div className="text-xs text-foreground/40 uppercase tracking-wider mb-2">
            Recommended Next Actions
          </div>
          <ul className="space-y-1.5">
            {data.recommended_next_actions.map((action, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-foreground/60"
              >
                <span className="text-accent leading-4">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expandable generated content */}
      {data?.follow_up_email && (
        <ExpandableSection
          title="Generated Follow-Up Email"
          content={data.follow_up_email}
        />
      )}

      {data?.proposal_outline && (
        <ExpandableSection
          title="Proposal Outline"
          content={data.proposal_outline}
        />
      )}

      {data?.suggested_pricing_range && (
        <ExpandableSection
          title="Suggested Pricing Range"
          content={data.suggested_pricing_range}
        />
      )}

      {/* Empty state */}
      {!data && (
        <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl px-5 py-8 text-center">
          <p className="text-sm text-foreground/40">
            Start a conversation to see real-time analytics
          </p>
        </div>
      )}
    </div>
  );
}
