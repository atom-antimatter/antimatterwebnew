"use client";

import { useState, useEffect } from "react";
import IntentIQAnalytics, {
  type IntentIQData,
} from "@/components/intentiq/IntentIQAnalytics";
import IntentIQChat from "@/components/intentiq/IntentIQChat";
import TransitionContainer from "@/components/ui/TransitionContainer";
import MainLayout from "@/components/ui/MainLayout";
import { motion } from "motion/react";
import { usePageTransition } from "@/store";

export default function AtomIntentIQClient() {
  const [analyticsData, setAnalyticsData] = useState<IntentIQData | null>(null);
  const setIsTransition = usePageTransition((s) => s.setIsTransition);

  useEffect(() => {
    setIsTransition(false);
  }, [setIsTransition]);

  return (
    <TransitionContainer initial={100} exit={-400}>
      <MainLayout className="pt-32 mobile:pt-52 md:pt-60">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-sm font-medium text-accent mb-6">
            Atom IntentIQ
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Buyer Intent AI for Enterprise Pipeline
          </h1>
          <p className="text-xl text-foreground/65 max-w-3xl mx-auto">
            Real-time conversation analysis with AI-powered intent scoring,
            lead qualification, and automated follow-up generation
          </p>
        </motion.div>

        {/* Main Content: Two-column split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Left: Analytics Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <IntentIQAnalytics data={analyticsData} />
          </motion.div>

          {/* Right: Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-[700px] lg:h-[800px]"
          >
            <IntentIQChat onAnalyticsUpdate={setAnalyticsData} />
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 mb-20"
        >
          <div className="bg-gradient-to-br from-foreground/5 to-foreground/10 backdrop-blur-sm border border-foreground/10 rounded-xl p-6">
            <div className="text-3xl font-bold text-accent mb-3">0-100</div>
            <h3 className="text-lg font-semibold mb-2">Intent Scoring</h3>
            <p className="text-sm text-foreground/65">
              Real-time scoring of buyer sentiment and purchase intent based on
              conversation signals
            </p>
          </div>

          <div className="bg-gradient-to-br from-foreground/5 to-foreground/10 backdrop-blur-sm border border-foreground/10 rounded-xl p-6">
            <div className="text-3xl font-bold text-accent mb-3">4</div>
            <h3 className="text-lg font-semibold mb-2">Buyer Stages</h3>
            <p className="text-sm text-foreground/65">
              Automatic classification: Research, Evaluation, Shortlist, or
              Decision stage
            </p>
          </div>

          <div className="bg-gradient-to-br from-foreground/5 to-foreground/10 backdrop-blur-sm border border-foreground/10 rounded-xl p-6">
            <div className="text-3xl font-bold text-accent mb-3">AI</div>
            <h3 className="text-lg font-semibold mb-2">Auto-Generated</h3>
            <p className="text-sm text-foreground/65">
              Instant follow-up emails, proposals, and pricing guidance ready to
              copy and send
            </p>
          </div>
        </motion.div>
      </MainLayout>
    </TransitionContainer>
  );
}
