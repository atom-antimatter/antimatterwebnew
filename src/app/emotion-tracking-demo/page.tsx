import { EmotionTrackingDemo } from "./EmotionTrackingDemo";

export default function EmotionTrackingDemoPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 pt-40 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            AI Emotion Tracking
            <br />
            <span className="text-secondary font-bold italic">Demo</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience comprehensive text emotion analysis powered by Hume AI&apos;s 53-dimensional emotion detection and OpenAI GPT-4&apos;s advanced sentiment and intent analysis.
          </p>
        </div>
        
        <EmotionTrackingDemo />
      </div>
    </div>
  );
}
