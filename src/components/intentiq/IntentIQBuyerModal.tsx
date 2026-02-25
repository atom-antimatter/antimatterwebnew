"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiXMark, HiChartBar, HiChevronDown, HiChevronUp } from "react-icons/hi2";
import type { IntentIQData } from "./IntentIQAnalytics";

interface IntentIQBuyerModalProps {
  data: IntentIQData | null;
}

function Expandable({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  if (!content) return null;
  return (
    <div className="border-t border-foreground/10 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <h4 className="text-xs text-foreground/40 uppercase tracking-wider">{title}</h4>
        {open ? (
          <HiChevronUp className="w-4 h-4 text-foreground/40" />
        ) : (
          <HiChevronDown className="w-4 h-4 text-foreground/40" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <pre className="whitespace-pre-wrap text-xs text-foreground/60 leading-relaxed font-sans mt-2">
              {content}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IntentIQBuyerModal({ data }: IntentIQBuyerModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-white text-black rounded-full shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-all hover:scale-105 border border-gray-200"
      >
        <HiChartBar className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-semibold hidden sm:inline">Buyer Intent</span>
        {data && (
          <span className={`text-xs font-bold ${data.intent_score >= 60 ? "text-green-600" : "text-gray-500"}`}>
            {data.intent_score}%
          </span>
        )}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-foreground/10 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/10">
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
                    <rect x="1" y="10" width="4" height="9" rx="1" fill="currentColor" opacity="0.5" />
                    <rect x="8" y="6" width="4" height="13" rx="1" fill="currentColor" opacity="0.7" />
                    <rect x="15" y="1" width="4" height="18" rx="1" fill="currentColor" />
                  </svg>
                  <h2 className="text-lg font-semibold">Buyer Intent Analysis</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-foreground/10 rounded-lg transition-colors"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              {/* Content — scrollable */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-4">
                {!data && (
                  <div className="text-center py-8 text-foreground/40 text-sm">
                    Start a conversation to see buyer intent scoring
                  </div>
                )}

                {data && (
                  <>
                    {/* Score cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-4">
                        <div className="text-xs text-foreground/40 uppercase tracking-wider">Sentiment</div>
                        <div className={`text-2xl font-bold mt-1 ${getScoreColor(data.sentiment_score)}`}>
                          {data.sentiment_score}<span className="text-sm text-foreground/30">/100</span>
                        </div>
                      </div>
                      <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-4">
                        <div className="text-xs text-foreground/40 uppercase tracking-wider">Intent</div>
                        <div className={`text-2xl font-bold mt-1 ${getScoreColor(data.intent_score)}`}>
                          {data.intent_score}<span className="text-sm text-foreground/30">/100</span>
                        </div>
                      </div>
                      <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-4">
                        <div className="text-xs text-foreground/40 uppercase tracking-wider">Stage</div>
                        <div className="text-sm font-semibold mt-1">{data.buyer_stage}</div>
                      </div>
                      <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-4">
                        <div className="text-xs text-foreground/40 uppercase tracking-wider">Urgency</div>
                        <div className={`text-sm font-semibold mt-1 ${
                          data.urgency_level === "High" ? "text-red-400" :
                          data.urgency_level === "Medium" ? "text-yellow-400" : "text-green-400"
                        }`}>{data.urgency_level}</div>
                      </div>
                    </div>

                    {/* Topics */}
                    {data.topics.length > 0 && (
                      <div>
                        <h4 className="text-xs text-foreground/40 uppercase tracking-wider mb-2">Topics</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {data.topics.map((topic, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-accent/15 text-accent text-xs rounded-full">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next actions */}
                    {data.recommended_next_actions.length > 0 && (
                      <div>
                        <h4 className="text-xs text-foreground/40 uppercase tracking-wider mb-2">Next Actions</h4>
                        <ul className="space-y-1.5">
                          {data.recommended_next_actions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-foreground/60">
                              <span className="text-accent mt-0.5">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Expandable sections */}
                    <Expandable title="Follow-Up Email" content={data.follow_up_email} />
                    <Expandable title="Proposal Outline" content={data.proposal_outline} />
                    <Expandable title="Pricing Range" content={data.suggested_pricing_range} />
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
