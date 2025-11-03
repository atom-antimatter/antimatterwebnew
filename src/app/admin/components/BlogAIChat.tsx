"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
  HiOutlineXMark,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import TipTapEditor from "./TipTapEditor";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  status?: "thinking" | "complete" | "error";
}

interface BlogAIChatProps {
  onClose: () => void;
  onContentGenerated: (content: {
    title: string;
    content: string;
    excerpt: string;
    keywords: string[];
    slug: string;
    featuredImage?: string;
  }) => void;
  existingPages?: string[];
}

export default function BlogAIChat({
  onClose,
  onContentGenerated,
  existingPages = [],
}: BlogAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI blog writing assistant. Tell me what topic you'd like to write about, and I'll help you create a comprehensive, SEO-optimized blog post. I can:\n\n• Research the topic and create an outline\n• Write engaging content with proper structure\n• Generate SEO metadata and keywords\n• Suggest relevant images and videos\n• Create internal links to your existing pages\n\nWhat would you like to write about?",
      timestamp: new Date(),
      status: "complete",
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [chapters, setChapters] = useState<Array<{ id: string; title: string; level: number }>>([]);
  const [currentPhase, setCurrentPhase] = useState<
    "idle" | "researching" | "outlining" | "writing" | "optimizing" | "complete"
  >("idle");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: Message["role"], content: string, status?: Message["status"]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      status: status || "complete",
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (id: string, content: string, status?: Message["status"]) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content, status: status || msg.status } : msg))
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput("");
    addMessage("user", userMessage);
    setIsProcessing(true);

    try {
      // Detect if user wants to generate a full blog
      if (
        messages.length <= 2 ||
        userMessage.toLowerCase().includes("write") ||
        userMessage.toLowerCase().includes("create") ||
        userMessage.toLowerCase().includes("generate")
      ) {
        await generateFullBlog(userMessage);
      } else {
        // Handle follow-up questions or refinements
        await handleFollowUp(userMessage);
      }
    } catch (error: any) {
      console.error("Error processing message:", error);
      addMessage("assistant", `Sorry, I encountered an error: ${error.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateFullBlog = async (topic: string) => {
    // Phase 1: Research
    setCurrentPhase("researching");
    const researchMsgId = addMessage(
      "assistant",
      "🔍 Researching your topic and analyzing the best approach...",
      "thinking"
    );

    try {
      const researchResponse = await fetch("/api/blog-ai-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, existingPages }),
      });

      if (!researchResponse.ok) throw new Error("Research failed");
      
      const research = await researchResponse.json();

      updateMessage(
        researchMsgId,
        `✅ Research complete! I've created an outline with ${research.outline.sections.length} main sections covering:\n\n${research.outline.sections
          .map((s: any) => `• ${s.heading}`)
          .join("\n")}\n\nKeywords: ${research.keywords.join(", ")}\n\nNow writing the full article...`,
        "complete"
      );

      // Phase 2: Generate Content
      setCurrentPhase("writing");
      const writingMsgId = addMessage(
        "assistant",
        "✍️ Writing your blog post with engaging content and proper structure...",
        "thinking"
      );

      const contentResponse = await fetch("/api/blog-ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ research, tone: "professional" }),
      });

      if (!contentResponse.ok) throw new Error("Content generation failed");
      
      const contentData = await contentResponse.json();

      setGeneratedContent(contentData.content.content);
      setGeneratedTitle(research.outline.title);
      setChapters(contentData.content.chapters);

      updateMessage(
        writingMsgId,
        `✅ Content written! The article is ${contentData.seo.readingTime} min read with ${contentData.content.chapters.length} chapters.\n\nNow optimizing SEO and generating metadata...`,
        "complete"
      );

      // Phase 3: SEO Optimization
      setCurrentPhase("optimizing");
      const seoMsgId = addMessage(
        "assistant",
        "🎯 Optimizing SEO metadata and generating featured image...",
        "thinking"
      );

      // Generate header image if needed
      let headerImageUrl = "";
      if (contentData.headerImage) {
        headerImageUrl = contentData.headerImage.url;
      }

      updateMessage(
        seoMsgId,
        `✅ All done! Your blog post is ready:\n\n**Title:** ${contentData.seo.title}\n**Slug:** ${contentData.seo.slug}\n**Meta Description:** ${contentData.seo.metaDescription}\n**Reading Time:** ${contentData.seo.readingTime} minutes\n**Keywords:** ${contentData.seo.keywords.join(", ")}\n\nThe content is now in the editor. Feel free to review and make any changes!`,
        "complete"
      );

      // Pass data to parent
      onContentGenerated({
        title: contentData.seo.title,
        content: contentData.content.content,
        excerpt: contentData.seo.metaDescription,
        keywords: contentData.seo.keywords,
        slug: contentData.seo.slug,
        featuredImage: headerImageUrl,
      });

      setCurrentPhase("complete");
    } catch (error: any) {
      addMessage("assistant", `❌ Error: ${error.message}`, "error");
      setCurrentPhase("idle");
    }
  };

  const handleFollowUp = async (message: string) => {
    // Handle refinement requests
    const thinkingMsgId = addMessage("assistant", "Thinking...", "thinking");

    try {
      const response = await fetch("/api/blog-ai-refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          currentContent: generatedContent,
          context: messages.slice(-5),
        }),
      });

      if (!response.ok) throw new Error("Refinement failed");
      
      const data = await response.json();

      if (data.updatedContent) {
        setGeneratedContent(data.updatedContent);
        updateMessage(thinkingMsgId, data.response, "complete");
      } else {
        updateMessage(thinkingMsgId, data.response, "complete");
      }
    } catch (error: any) {
      updateMessage(thinkingMsgId, `Error: ${error.message}`, "error");
    }
  };

  const handleRegenerate = () => {
    if (!isProcessing) {
      setMessages([messages[0]]);
      setGeneratedContent("");
      setGeneratedTitle("");
      setChapters([]);
      setCurrentPhase("idle");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex">
      {/* Chat Panel */}
      <div className="w-full lg:w-1/2 flex flex-col border-r border-zinc-800">
        {/* Header */}
        <div className="bg-zinc-900/95 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HiOutlineSparkles className="w-6 h-6 text-secondary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">AI Blog Assistant</h2>
              <p className="text-sm text-foreground/60">
                {currentPhase !== "idle" && (
                  <span className="capitalize">{currentPhase}...</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRegenerate}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Start Over"
              disabled={isProcessing}
            >
              <HiOutlineArrowPath className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Close"
            >
              <HiOutlineXMark className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-secondary text-white"
                      : "bg-zinc-800/50 text-foreground"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.status === "thinking" && (
                    <div className="flex items-center space-x-1 mt-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-zinc-900/95 border-t border-zinc-800 px-6 py-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className="p-3 bg-secondary hover:bg-secondary/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiOutlinePaperAirplane className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="hidden lg:flex flex-col flex-1 bg-zinc-900/50">
        <div className="bg-zinc-900/95 border-b border-zinc-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-foreground">
            {generatedTitle || "Generated Content"}
          </h3>
          {chapters.length > 0 && (
            <p className="text-sm text-foreground/60 mt-1">
              {chapters.length} chapters • Ready to edit
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {generatedContent ? (
            <TipTapEditor
              content={generatedContent}
              onChange={setGeneratedContent}
              onChaptersChange={setChapters}
              placeholder="Generated content will appear here..."
              blogTitle={generatedTitle}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-foreground/40">
              <div className="text-center">
                <HiOutlineSparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Your generated content will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




