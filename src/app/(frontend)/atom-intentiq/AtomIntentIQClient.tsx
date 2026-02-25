"use client";

import { useState, useEffect, useCallback } from "react";
import IntentIQChat from "@/components/intentiq/IntentIQChat";
import type { IntentIQData } from "@/components/intentiq/IntentIQAnalytics";
import IntentIQBuyerModal from "@/components/intentiq/IntentIQBuyerModal";
import IntentIQDiscovery, {
  type IntentIQContext,
} from "@/components/intentiq/IntentIQDiscovery";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import { usePageTransition } from "@/store";

export default function AtomIntentIQClient() {
  const [analyticsData, setAnalyticsData] = useState<IntentIQData | null>(null);
  const [discoveryContext, setDiscoveryContext] = useState<IntentIQContext>({
    industry: "",
    companySize: "",
    priorities: [],
    currentTools: "",
    timeline: "",
  });
  const setIsTransition = usePageTransition((s) => s.setIsTransition);

  useEffect(() => {
    setIsTransition(false);
  }, [setIsTransition]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Custom header */}
      <header className="border-b border-foreground/10 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-6">
          <Link
            href="/enterprise-ai"
            className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Atom
          </Link>
          <div className="hidden sm:block h-5 w-px bg-foreground/15" />
          <h1 className="hidden sm:block text-lg font-semibold">
            Atom IntentIQ
          </h1>
        </div>
      </header>

      {/* Main: discovery sidebar + chat */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Discovery panel */}
          <div className="lg:w-[360px] xl:w-[400px] shrink-0">
            <div className="lg:sticky lg:top-16">
              <IntentIQDiscovery
                context={discoveryContext}
                onChange={setDiscoveryContext}
              />
            </div>
          </div>

          {/* Right: Chat */}
          <div
            className="flex-1 min-w-0 lg:sticky lg:top-16"
            style={{ height: "calc(100vh - 80px)" }}
          >
            <IntentIQChat
              onAnalyticsUpdate={setAnalyticsData}
              discoveryContext={discoveryContext}
            />
          </div>
        </div>
      </div>

      {/* Buyer Intent floating modal */}
      <IntentIQBuyerModal data={analyticsData} />
    </div>
  );
}
