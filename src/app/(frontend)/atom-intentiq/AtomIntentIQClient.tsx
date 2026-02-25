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
    <div className="bg-background pt-28 md:pt-32 pb-10 px-6 lg:px-10">
      {/* Compact page header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Atom IntentIQ</h1>
        <p className="text-sm text-foreground/50">
          AI-powered buyer intent scoring with real-time analytics
        </p>
      </header>

      {/* Main split view with fixed height so neither panel scrolls the page */}
      <div
        className="flex flex-col lg:flex-row gap-6"
        style={{ height: "calc(100vh - 180px)", minHeight: "600px" }}
      >
        {/* Left: Admin Analytics Panel — scrolls independently */}
        <div className="lg:w-[420px] xl:w-[480px] shrink-0 overflow-y-auto overscroll-contain lg:pr-2 min-h-[300px] lg:min-h-0">
          <IntentIQAnalytics data={analyticsData} />
        </div>

        {/* Right: Live Chat Interface — contained, never pushes page */}
        <div className="flex-1 min-h-[400px] lg:min-h-0 min-w-0">
          <IntentIQChat onAnalyticsUpdate={setAnalyticsData} />
        </div>
      </div>
    </div>
  );
}
