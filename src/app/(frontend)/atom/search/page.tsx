"use client";
<<<<<<< HEAD
import { useState } from "react";
import { motion } from "motion/react";
import TransitionLink from "@/components/ui/TransitionLink";
import { HiSearch, HiArrowLeft } from "react-icons/hi2";
=======
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import TransitionLink from "@/components/ui/TransitionLink";
import { HiMagnifyingGlass, HiArrowLeft, HiSparkles, HiGlobeAlt, HiPhoto } from "react-icons/hi2";
import Image from "next/image";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
}

interface ImageResult {
  url: string;
  title: string;
  source: string;
}
>>>>>>> 367532d (fix: replace HiSearch imports and escape apostrophes)

export default function AtomSearchPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setSearching(true);
    // TODO: Integrate Thesys C1 + search providers
    setTimeout(() => {
      setSearching(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-main mx-auto py-20 px-4">
        <TransitionLink
          href="/"
          className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition mb-8"
        >
          <HiArrowLeft className="size-4" />
          Back to Home
        </TransitionLink>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-8 mt-12"
        >
<<<<<<< HEAD
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <HiSearch className="size-8 text-primary" />
=======
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <HiMagnifyingGlass className="size-7 text-white" />
>>>>>>> 367532d (fix: replace HiSearch imports and escape apostrophes)
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-center">
            Atom <span className="text-primary">Search</span>
          </h1>

          <p className="text-xl md:text-2xl opacity-70 max-w-2xl text-center">
            Next-generation AI search with generative UI. Experience intelligent
            search results tailored to your queries.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-3xl mt-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything..."
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-lg"
              />
              <button
                type="submit"
                disabled={searching || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary hover:bg-primary/80 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          <div className="mt-12 w-full max-w-4xl">
            <div className="p-8 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-sm opacity-60">
                🚧 Integration in progress. Atom Search will feature:
              </p>
              <ul className="mt-4 text-left max-w-md mx-auto space-y-2 opacity-70">
                <li>• AI-powered web search with Gemini & Exa</li>
                <li>• Dynamic generative UI components</li>
                <li>• Real-time streaming responses</li>
                <li>• Image & multimedia search</li>
                <li>• Context-aware result summaries</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

