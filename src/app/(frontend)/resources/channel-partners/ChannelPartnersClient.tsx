"use client";

import { useState, useEffect, useCallback } from "react";
import { vendors } from "@/data/vendorMatrix";
import PartnerDiscoveryWizard, {
  type DiscoveryContext,
} from "@/components/channelPartners/PartnerDiscoveryWizard";
import PartnerChatInterface, {
  type ChatMessage,
} from "@/components/channelPartners/PartnerChatInterface";
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

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handleMessagesChange = useCallback((messages: ChatMessage[]) => {
    setChatMessages(messages);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-foreground/10 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
      </header>

      {/* Main content: sidebar + chat */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar: Discovery wizard */}
          <div className="lg:w-[360px] xl:w-[400px] shrink-0">
            <div className="lg:sticky lg:top-24">
              <PartnerDiscoveryWizard
                vendors={vendors}
                onChange={setDiscoveryContext}
                onReset={() => {}}
              />
            </div>
          </div>

          {/* Right: Chat interface fills remaining space */}
          <div
            className="flex-1 min-w-0 lg:sticky lg:top-24"
            style={{ height: "calc(100vh - 140px)" }}
          >
            <PartnerChatInterface
              context={discoveryContext}
              onOutputsGenerated={() => {}}
              onMessagesChange={handleMessagesChange}
            />
          </div>
        </div>
      </div>

      {/* Buyer Intent floating modal */}
      <BuyerIntentModal messages={chatMessages} context={discoveryContext} />
    </div>
  );
}
