"use client";

import { useState, useRef, useEffect } from "react";
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

const suggestedPrompts = [
  "We're evaluating vendors — how do you handle SOC2 and HIPAA?",
  "What would a 90-day pilot look like?",
  "Draft a follow-up email based on this conversation.",
  "Summarize buyer needs and next steps.",
];

export default function IntentIQChat({ onAnalyticsUpdate }: IntentIQChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Ask anything about Atom or Antimatter AI. I'll answer using the latest product context and score the conversation in real-time.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4 min-h-0">
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

      {/* Suggested follow-ups — shown when few messages */}
      {messages.length <= 2 && !isLoading && (
        <div className="shrink-0 border-t border-foreground/10 px-5 py-3">
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, idx) => (
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

      {/* Input — sticky at bottom */}
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
