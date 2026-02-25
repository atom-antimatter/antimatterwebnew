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
    <div className="bg-background pt-28 md:pt-32 pb-32 px-6 lg:px-10">
      {/* Compact page header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Atom IntentIQ</h1>
        <p className="text-sm text-foreground/50">
          AI-powered buyer intent scoring with real-time analytics
        </p>
      </header>

      {/* Split view: analytics grows freely, chat is viewport-pinned */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Analytics — grows to fit all content, no height constraint */}
        <div className="lg:w-[420px] xl:w-[480px] shrink-0">
          <IntentIQAnalytics data={analyticsData} />
        </div>

        {/* Right: Chat — fixed to viewport height, sticky on desktop */}
        <div
          className="flex-1 min-w-0 lg:sticky lg:top-28"
          style={{ height: "calc(100vh - 140px)" }}
        >
          <IntentIQChat onAnalyticsUpdate={setAnalyticsData} />
        </div>
      </div>
    </div>
  );
}
