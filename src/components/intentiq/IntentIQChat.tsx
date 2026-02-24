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
        "Hi! I'm Atom IntentIQ. I analyze buyer conversations in real-time to help you qualify leads and close deals faster. Try one of the suggested prompts below or tell me about your customer's needs.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    const maxHeight = 120;
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-foreground/5 to-foreground/10 backdrop-blur-sm border border-foreground/10 rounded-xl overflow-hidden">
      {/* Suggested Prompts */}
      <div className="border-b border-foreground/10 bg-foreground/5 p-4">
        <h3 className="text-sm font-semibold text-foreground/50 mb-3">
          Try asking:
        </h3>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs bg-accent/10 hover:bg-accent hover:text-black border border-accent/20 hover:border-accent rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-accent text-black"
                    : "bg-foreground/10 border border-foreground/10"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
            <div className="bg-foreground/10 border border-foreground/10 rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-foreground/10 p-4 bg-foreground/5">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe your customer's needs and priorities..."
            className="flex-1 bg-background/50 border border-foreground/10 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 min-h-[44px] max-h-[120px]"
            rows={1}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-accent text-black rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <HiPaperAirplane className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
