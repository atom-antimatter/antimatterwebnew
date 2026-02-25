"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { HiPaperAirplane } from "react-icons/hi2";
import { motion, AnimatePresence } from "motion/react";
import type { IntentIQData } from "./IntentIQAnalytics";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface IntentIQChatProps {
  onAnalyticsUpdate: (data: IntentIQData) => void;
}

const initialPrompts = [
  "We're evaluating vendors — how do you handle SOC2 and HIPAA?",
  "Our prospect needs on-prem deployment. How does Atom compare?",
  "Walk me through a typical enterprise discovery call for Atom.",
  "What questions should I ask to qualify a healthcare buyer?",
];

function getFollowUpPrompts(
  messageCount: number,
  lastData: IntentIQData | null
): string[] {
  if (messageCount <= 2) return [];

  if (!lastData) {
    return [
      "What deployment options matter most to this buyer?",
      "Help me understand their compliance requirements.",
    ];
  }

  const stage = lastData.buyer_stage;
  const intent = lastData.intent_score;

  if (stage === "Research" || intent < 40) {
    return [
      "What pain points should I probe for next?",
      "Help me move this conversation from research to evaluation.",
      "What differentiators matter most at this stage?",
    ];
  }

  if (stage === "Evaluation" || intent < 65) {
    return [
      "Draft a follow-up email based on this conversation.",
      "What objections should I prepare for?",
      "Create a comparison table vs their current shortlist.",
    ];
  }

  if (stage === "Shortlist" || intent < 85) {
    return [
      "Draft a proposal outline with scope and timeline.",
      "What pricing range should I present?",
      "What does a 90-day pilot look like for this buyer?",
    ];
  }

  return [
    "Draft a proposal with pricing tiers for this deal.",
    "Summarize the full buyer profile and recommended next steps.",
    "Write an executive summary I can share with their CTO.",
  ];
}

export default function IntentIQChat({ onAnalyticsUpdate }: IntentIQChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "I'm Atom IntentIQ. Describe your prospect's situation and I'll score intent, suggest next steps, and generate follow-ups in real-time. Pick a prompt below to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastData, setLastData] = useState<IntentIQData | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const message = messageText || input.trim();
    if (!message || isLoading) return;

    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await fetch("/api/intentiq-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.assistant_response },
      ]);

      setLastData(data);
      onAnalyticsUpdate(data);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    const maxHeight = 96;
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
  };

  const showInitialPrompts = messages.length <= 1 && !isLoading;
  const followUpPrompts = useMemo(
    () => getFollowUpPrompts(messages.length, lastData),
    [messages.length, lastData]
  );
  const showFollowUps = followUpPrompts.length > 0 && !isLoading && !showInitialPrompts;

  return (
    <div className="flex flex-col h-full bg-foreground/[0.03] border border-foreground/10 rounded-xl overflow-hidden">
      {/* Chat header */}
      <div className="shrink-0 border-b border-foreground/10 px-5 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
          IQ
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">
            Atom IntentIQ
          </div>
          <div className="text-[11px] text-foreground/40">
            Powered by GPT-4o &amp; your context
          </div>
        </div>
        {isLoading && (
          <span className="ml-auto text-xs text-foreground/40 animate-pulse">
            Thinking...
          </span>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4 min-h-0"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
                  message.role === "user"
                    ? "bg-accent text-black rounded-br-sm"
                    : "bg-foreground/10 rounded-bl-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-foreground/10 rounded-xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center text-xs text-foreground/40">
                <span>Thinking through your answer</span>
                <span className="flex gap-0.5">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Initial prompts — discovery starters */}
      {showInitialPrompts && (
        <div className="shrink-0 border-t border-foreground/10 px-5 py-3">
          <p className="text-[11px] text-foreground/40 uppercase tracking-wider mb-2">
            Start a discovery conversation
          </p>
          <div className="flex flex-wrap gap-2">
            {initialPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 text-xs bg-foreground/5 hover:bg-accent hover:text-black border border-foreground/10 hover:border-accent rounded-lg transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up prompts — contextual to buyer stage */}
      {showFollowUps && (
        <div className="shrink-0 border-t border-foreground/10 px-5 py-3">
          <p className="text-[11px] text-foreground/40 uppercase tracking-wider mb-2">
            Suggested follow-ups
          </p>
          <div className="flex flex-wrap gap-2">
            {followUpPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs bg-foreground/5 hover:bg-accent hover:text-black border border-foreground/10 hover:border-accent rounded-lg transition-all disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-foreground/10 px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="How can we help? (Shift+Enter for new line)"
            className="flex-1 bg-transparent border-0 px-1 py-1.5 text-sm resize-none focus:outline-none min-h-[36px] max-h-[96px] placeholder:text-foreground/30"
            rows={1}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-accent text-black rounded-full hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <HiPaperAirplane className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
