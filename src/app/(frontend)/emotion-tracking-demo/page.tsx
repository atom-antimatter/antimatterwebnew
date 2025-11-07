"use client";

import { EmotionTrackingDemo } from "./EmotionTrackingDemo";

export default function EmotionTrackingDemoPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full max-w-[90vw] lg:max-w-7xl mx-auto px-4 pt-32 mobile:pt-52 md:pt-52 pb-40">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            AI Emotion Tracking
            <br />
            <span className="text-secondary font-bold italic">Demo</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Understand emotions at scale. Test our AI that detects sentiment
            from faces and text.
          </p>
        </div>

        <EmotionTrackingDemo />
      </div>
    </div>
  );
}
