"use client";

import { useState, useEffect } from "react";
import IntentIQAnalytics, {
  type IntentIQData,
} from "@/components/intentiq/IntentIQAnalytics";
import IntentIQChat from "@/components/intentiq/IntentIQChat";
import { usePageTransition } from "@/store";

export default function AtomIntentIQClient() {
  const [analyticsData, setAnalyticsData] = useState<IntentIQData | null>(null);
  const setIsTransition = usePageTransition((s) => s.setIsTransition);

  useEffect(() => {
    setIsTransition(false);
  }, [setIsTransition]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Compact page header */}
      <header className="shrink-0 px-6 lg:px-10 pt-24 pb-4">
        <h1 className="text-2xl font-bold">Atom IntentIQ</h1>
        <p className="text-sm text-foreground/50">
          AI-powered buyer intent scoring with real-time analytics
        </p>
      </header>

      {/* Main split view — fills remaining viewport */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 px-6 lg:px-10 pb-6">
        {/* Left: Admin Analytics Panel */}
        <div className="lg:w-[420px] xl:w-[480px] shrink-0 overflow-y-auto lg:pr-2">
          <IntentIQAnalytics data={analyticsData} />
        </div>

        {/* Right: Live Chat Interface */}
        <div className="flex-1 min-h-0 min-w-0">
          <IntentIQChat onAnalyticsUpdate={setAnalyticsData} />
        </div>
      </div>
    </div>
  );
}
