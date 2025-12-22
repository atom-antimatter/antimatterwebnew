"use client";

import { Vendor } from "@/data/vendorMatrix";
import { useState, useRef, useEffect } from "react";
import { HiXMark, HiChatBubbleLeftRight, HiPaperAirplane } from "react-icons/hi2";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ThinkingLoader from "./ThinkingLoader";
import SuggestedPrompts from "./SuggestedPrompts";

interface Message {
  role: "user" | "assistant" | "system";
  type?: "text" | "lead_form" | "lead_success";
  content: string;
  formData?: any;
}

interface AtomChatWidgetProps {
  selectedVendors: Vendor[];
  selectedFilters: (keyof Vendor['capabilities'])[];
  initialPrompt?: string;
}

export default function AtomChatWidget({
  selectedVendors,
  selectedFilters,
  initialPrompt,
}: AtomChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Send message programmatically (for suggested prompts)
  const sendPrompt = async (promptText: string) => {
    if (isLoading) return; // Prevent double-send
    
    const trimmedPrompt = promptText.trim();
    if (!trimmedPrompt) return;

    setMessages((prev) => [...prev, { role: "user", type: "text", content: trimmedPrompt }]);
    setIsLoading(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", type: "text", content: "" }]);
    const assistantMessageIndex = messages.length + 1;

    try {
      const response = await fetch("/api/atom-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: trimmedPrompt }],
          selectedVendors: selectedVendors.map((v) => ({
            id: v.id,
            name: v.name,
            deployment: v.typicalDeployment,
            ipOwnership: v.ipOwnership,
            bestFit: v.bestFit,
            differentiatorVsAtom: v.differentiatorVsAtom,
            capabilities: v.capabilities,
          })),
          selectedFilters,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Read Server-Sent Events stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.done) {
                break;
              }
              
              if (data.content) {
                // Throttle UI updates slightly for smoother streaming feel (20ms)
                await new Promise(resolve => setTimeout(resolve, 20));
                
                setMessages((prev) => {
                  const updated = [...prev];
                  if (updated[assistantMessageIndex]) {
                    updated[assistantMessageIndex].content += data.content;
                  }
                  return updated;
                });
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[assistantMessageIndex]) {
          updated[assistantMessageIndex].content = "Sorry, I encountered an error. Please try again.";
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Prevent background scrolling when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Auto-focus input when chat opens
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      type: "text",
      content:
        "Hi — I'm Atom Chat. What do you want to compare: deployment, IP ownership, security, voice, RAG, GenUI, or tool calling?",
    },
  ]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const currentModel = "GPT-5.2"; // Locked to GPT-5.2 Responses API
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamBufferRef = useRef<string>("");
  const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-grow up to 4 lines (~96px)
    const textarea = e.target;
    textarea.style.height = "auto";
    const maxHeight = 96; // ~4 lines with line-height 1.5
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    resetTextareaHeight();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    const assistantMessageIndex = messages.length + 1;

    try {
      const response = await fetch("/api/atom-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          selectedVendors: selectedVendors.map((v) => ({
            id: v.id,
            name: v.name,
            deployment: v.typicalDeployment,
            ipOwnership: v.ipOwnership,
            bestFit: v.bestFit,
            differentiatorVsAtom: v.differentiatorVsAtom,
            capabilities: v.capabilities,
          })),
          selectedFilters,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Read Server-Sent Events stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.done) {
                break;
              }
              
              if (data.content) {
                // Throttle UI updates slightly for smoother streaming feel (20ms)
                await new Promise(resolve => setTimeout(resolve, 20));
                
                setMessages((prev) => {
                  const updated = [...prev];
                  if (updated[assistantMessageIndex]) {
                    updated[assistantMessageIndex].content += data.content;
                  }
                  return updated;
                });
              }
            } catch (parseError) {
              console.warn("Failed to parse SSE data:", line);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[assistantMessageIndex]) {
          updated[assistantMessageIndex].content = "Sorry, I encountered an error. Please try again.";
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-secondary text-white rounded-full shadow-lg hover:bg-secondary/90 transition-colors z-50 flex items-center justify-center"
        >
          <HiChatBubbleLeftRight className="w-6 h-6" />
        </motion.button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[360px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <HiChatBubbleLeftRight className="w-5 h-5 text-secondary" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-foreground">Atom Chat</h3>
                  <p className="text-xs text-foreground/60">Ask about this comparison</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-foreground/60 hover:text-foreground transition-colors"
                aria-label="Close chat"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Messages - Prompt-kit inspired layout */}
            <div 
              className="flex-1 overflow-y-auto px-4 py-6 space-y-6 overscroll-contain"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              style={{ maxHeight: "calc(100% - 200px)" }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl break-words overflow-wrap-anywhere shadow-sm ${
                      msg.role === "user"
                        ? "bg-secondary/90 text-white"
                        : "bg-white/5 backdrop-blur-sm border border-white/10 text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none overflow-hidden">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ node, ...props }) => (
                              <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary hover:text-secondary/80 underline"
                              />
                            ),
                            p: ({ node, ...props }) => <p {...props} className="my-2 first:mt-0 last:mb-0" />,
                            ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-4 my-2 space-y-1" />,
                            ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-4 my-2 space-y-1" />,
                            li: ({ node, ...props }) => <li {...props} className="text-foreground/90" />,
                            strong: ({ node, ...props }) => <strong {...props} className="font-semibold text-foreground" />,
                            code: ({ node, ...props }) => <code {...props} className="bg-zinc-900 px-1 py-0.5 rounded text-xs" />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Suggested prompts when chat is empty */}
              {messages.length === 1 && !isLoading && (
                <div className="mt-4">
                  <p className="text-xs text-foreground/50 mb-2.5">Quick actions</p>
                  <SuggestedPrompts 
                    vendors={selectedVendors} 
                    onPromptClick={(prompt) => {
                      sendPrompt(prompt);
                    }} 
                  />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-800">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this comparison..."
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-2xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-colors text-sm resize-none overflow-y-auto leading-6"
                  style={{ 
                    minHeight: "40px",
                    maxHeight: "96px"
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                  aria-label="Send message"
                >
                  <HiPaperAirplane className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-end mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-foreground/40">Powered by</span>
                  <img 
                    src="/images/openai-logo.svg" 
                    alt="OpenAI" 
                    className="h-3 w-auto opacity-40"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

