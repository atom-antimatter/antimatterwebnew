"use client";

import { useState, useEffect, useCallback } from "react";
import { vendors } from "@/data/vendorMatrix";
import PartnerDiscoveryWizard, {
  type DiscoveryContext,
} from "@/components/channelPartners/PartnerDiscoveryWizard";
import SalesAssistPromptDock from "@/components/channelPartners/SalesAssistPromptDock";
import PartnerChatInterface, {
  type ChatMessage,
} from "@/components/channelPartners/PartnerChatInterface";
import OutputTabsDrawer, {
  type SalesOutputs,
} from "@/components/channelPartners/OutputTabsDrawer";
import BuyerIntentModal from "@/components/channelPartners/BuyerIntentModal";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import { usePageTransition } from "@/store";

export default function ChannelPartnersClient() {
  const setIsTransition = usePageTransition((s) => s.setIsTransition);

  useEffect(() => {
    setIsTransition(false);
  }, [setIsTransition]);

  const [discoveryContext, setDiscoveryContext] = useState<DiscoveryContext>({
    competitors: [],
    customerPriorities: [],
    deploymentNeeds: [],
    useCase: {},
    buyerPersona: undefined,
  });

  const [outputs, setOutputs] = useState<SalesOutputs>({});
  const [promptToSend, setPromptToSend] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handlePromptClick = (prompt: string) => {
    setPromptToSend(prompt);
    setTimeout(() => setPromptToSend(null), 100);
  };

  const handleReset = () => {
    setOutputs({});
  };

  const handleMessagesChange = useCallback((messages: ChatMessage[]) => {
    setChatMessages(messages);
  }, []);

  const hasOutputs = Object.keys(outputs).some(
    (key) => outputs[key as keyof SalesOutputs]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-foreground/10 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/resources/vendor-matrix"
                className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors mb-2"
              >
                <HiArrowLeft className="w-4 h-4" />
                Back to Vendor Matrix
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold">
                Channel Partner Sales Assist
              </h1>
              <p className="text-foreground/65 text-sm md:text-base mt-1">
                Ask questions, compare vendors, and generate follow-ups,
                proposals, and pricing in minutes.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Discovery */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <PartnerDiscoveryWizard
                vendors={vendors}
                onChange={setDiscoveryContext}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* Right column - Chat & Outputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Dock */}
            <SalesAssistPromptDock
              context={discoveryContext}
              onPromptClick={handlePromptClick}
            />

            {/* Chat Interface */}
            <div className="h-[500px] lg:h-[600px]">
              <PartnerChatInterface
                context={discoveryContext}
                onOutputsGenerated={setOutputs}
                promptToSend={promptToSend}
                onMessagesChange={handleMessagesChange}
              />
            </div>

            {/* Outputs Drawer */}
            {hasOutputs && (
              <OutputTabsDrawer outputs={outputs} isVisible={hasOutputs} />
            )}
          </div>
        </div>
      </div>

      {/* Buyer Intent floating modal */}
      <BuyerIntentModal messages={chatMessages} context={discoveryContext} />
    </div>
  );
}
