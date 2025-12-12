"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import TransitionLink from "@/components/ui/TransitionLink";
import { HiSearch, HiArrowLeft, HiSparkles, HiGlobeAlt, HiPhoto } from "react-icons/hi2";
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

export default function AtomSearchPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setSearching(true);
    setError("");
    setResults([]);
    setImages([]);
    setSummary("");

    try {
      const response = await fetch('/api/atom/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // Simulate streaming effect for summary
      if (data.summary) {
        let currentText = "";
        const words = data.summary.split(" ");
        for (let i = 0; i < words.length; i++) {
          currentText += words[i] + " ";
          setSummary(currentText);
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }
      
      setResults(data.results || []);
      setImages(data.images || []);

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-main mx-auto py-12 px-4">
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
          className="flex flex-col items-center gap-6 mt-8"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <HiSparkles className="size-7 text-white" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-center">
            Atom <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Search</span>
          </h1>

          <p className="text-lg md:text-xl opacity-70 max-w-2xl text-center">
            AI-powered search with intelligent summaries and dynamic results
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-3xl mt-6">
            <div className="relative group">
              <HiSearch className="absolute left-5 top-1/2 -translate-y-1/2 size-5 opacity-40 group-focus-within:opacity-70 transition" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything... Try 'latest AI trends' or 'quantum computing'"
                className="w-full pl-14 pr-32 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-white/10 transition text-base"
                autoFocus
              />
              <button
                type="submit"
                disabled={searching || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {searching ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚡</span> Searching
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-3xl p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Results Section */}
        <div ref={resultsRef} className="mt-16 max-w-4xl mx-auto">
          <AnimatePresence>
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-8 p-6 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl"
              >
                <div className="flex items-start gap-3">
                  <HiSparkles className="size-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">AI Summary</h3>
                    <p className="text-foreground/80 leading-relaxed">{summary}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <HiPhoto className="size-5 text-accent" />
                  <h3 className="text-lg font-semibold">Images</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {images.map((img, i) => (
                    <motion.a
                      key={i}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative aspect-square rounded-lg overflow-hidden group hover:ring-2 hover:ring-primary transition"
                    >
                      <Image
                        src={img.url}
                        alt={img.title}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-300"
                      />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}

            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <HiGlobeAlt className="size-5 text-secondary" />
                  <h3 className="text-lg font-semibold">Web Results</h3>
                </div>
                <div className="space-y-4">
                  {results.map((result, i) => (
                    <motion.a
                      key={i}
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="block p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-xl transition group"
                    >
                      <div className="flex items-start gap-3">
                        {result.favicon && (
                          <Image
                            src={result.favicon}
                            alt=""
                            width={20}
                            height={20}
                            className="mt-1 rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold group-hover:text-primary transition mb-1">
                            {result.title}
                          </h4>
                          <p className="text-sm opacity-70 leading-relaxed mb-2">
                            {result.snippet}
                          </p>
                          <span className="text-xs text-accent">
                            {new URL(result.url).hostname}
                          </span>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!searching && !results.length && !summary && !error && (
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { q: "Latest AI trends in 2025", icon: "🤖" },
                  { q: "How does quantum computing work?", icon: "⚛️" },
                  { q: "Best practices for web development", icon: "💻" },
                  { q: "Climate change solutions", icon: "🌍" },
                ].map((suggestion) => (
                  <button
                    key={suggestion.q}
                    onClick={() => {
                      setQuery(suggestion.q);
                      handleSearch(new Event('submit') as any);
                    }}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-xl text-left transition group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{suggestion.icon}</span>
                      <span className="text-sm group-hover:text-primary transition">
                        {suggestion.q}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

