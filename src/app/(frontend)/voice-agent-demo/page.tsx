import type { Metadata } from "next";
import VoiceAgentDemo from "./VoiceAgentDemo";

export const metadata: Metadata = {
  title: "Try Antimatter Voice Agent",
  description:
    "Experience our AI-powered voice agent trained on Antimatter AI's knowledge base. Natural conversations powered by advanced AI.",
};

const VoiceAgentDemoPage = () => {
  return (
    <div className="pt-40 lg:pt-54 xl:pt-72 min-h-screen">
      <VoiceAgentDemo />
    </div>
  );
};

export default VoiceAgentDemoPage;

