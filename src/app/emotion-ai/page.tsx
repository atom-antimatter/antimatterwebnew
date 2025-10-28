import ServiceComponent from "../[services]/ServiceComponent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emotion AI & Sentiment Analysis | Antimatter AI",
  description:
    "Advanced emotion detection and sentiment analysis powered by our custom AI built on Hume AI and OpenAI GPT-5. Real-time facial expression tracking and 53-dimensional text emotion analysis.",
};

export default function EmotionAIPage() {
  return <ServiceComponent />;
}
