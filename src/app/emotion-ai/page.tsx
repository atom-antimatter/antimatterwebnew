import ServiceComponent from "../[services]/ServiceComponent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sentiment AI for Data-Driven Decisions | Antimatter AI",
  description:
    "Transform emotional data into business intelligence. Analyze customer calls, employee feedback, and user interactions to make informed decisions that drive growth and retention.",
};

export default function EmotionAIPage() {
  return <ServiceComponent />;
}
