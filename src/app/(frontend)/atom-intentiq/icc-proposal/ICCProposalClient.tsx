"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import styles from "@/components/ui/css/Button.module.css";
import {
  HiArrowLeft, HiChevronDown, HiChevronUp, HiPaperAirplane,
  HiMagnifyingGlass, HiDocumentText, HiChartBar, HiCpuChip,
  HiCheckCircle, HiClock, HiArrowPath, HiBookOpen,
  HiExclamationTriangle, HiHandThumbUp, HiHandThumbDown,
  HiCodeBracket, HiChatBubbleLeftRight, HiEye,
} from "react-icons/hi2";
import {
  PROMPT_CHIPS, PROBLEM_CARDS, ARCHITECTURE_BLOCKS, ARCHITECTURE_DETAILS,
  DASHBOARD_METRICS, TOP_CODE_FAMILIES, TOP_SEARCH_TOPICS,
  MVP_SCOPE, FUTURE_SCOPE, USE_CASES, PRICING,
} from "@/data/iccProposalDemo";

// ─── Chat types ───────────────────────────────────────────────────────────────

type ChatMessage = { role: "user" | "assistant"; content: string };

// ─── Streaming chat hook ──────────────────────────────────────────────────────

function useICCChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);

  const send = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setStreaming(true);

    try {
      const res = await fetch("/api/icc-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try {
            const { content } = JSON.parse(line.slice(6));
            if (content) {
              assistantText += content;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "I wasn't able to process that request. Please try again or select a sample prompt." }]);
    } finally {
      setStreaming(false);
    }
  }, [messages]);

  return { messages, streaming, send };
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  search: <HiMagnifyingGlass className="w-5 h-5" />,
  code: <HiCodeBracket className="w-5 h-5" />,
  document: <HiDocumentText className="w-5 h-5" />,
  chart: <HiChartBar className="w-5 h-5" />,
};

// ─── Bar chart ────────────────────────────────────────────────────────────────

function MiniBar({ data, color = "bg-accent" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="space-y-1.5">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-[10px] text-foreground/50 w-28 shrink-0 text-right">{d.label}</span>
          <div className="flex-1 h-4 bg-foreground/5 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="text-[10px] text-foreground/40 w-8">{d.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ICCProposalClient() {
  const demoRef = useRef<HTMLDivElement>(null);
  const archRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const { messages, streaming, send } = useICCChat();
  const heroRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || streaming) return;
    setInput("");
    send(q);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-5 border-b border-foreground/10 bg-background/90 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <Link href="/atom-intentiq" className="flex items-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors">
            <HiArrowLeft className="w-3.5 h-3.5" /> Back to Atom
          </Link>
          <span className="text-foreground/15">|</span>
          <h1 className="text-sm font-semibold">ICC AI Assistant <span className="text-accent">Proposal</span></h1>
        </div>
        <span className="text-[10px] text-foreground/30 hidden sm:block">Confidential · Proposal Document</span>
      </header>

      {/* ═══ SECTION 1 — HERO ═══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden border-b border-foreground/5"
        style={{ background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(162,163,233,0.12), transparent 40%)` }}
      >
        <div className="max-w-5xl mx-auto px-5 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-1">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-3">Custom RAG Solution</motion.p>
              <motion.h2
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-4xl font-bold leading-tight mb-4"
              >
                ICC AI Assistant: Custom RAG Search &amp; Insights Layer
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-sm text-foreground/60 leading-relaxed mb-6 max-w-xl">
                A custom, citation-backed AI assistant embedded within ICC&rsquo;s existing digital experience to improve code discovery, support proposal research, and surface user behavior insights.
              </motion.p>
              <ul className="space-y-2 mb-8 text-sm text-foreground/70">
                <li className="flex items-center gap-2"><HiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Natural-language code and content search</li>
                <li className="flex items-center gap-2"><HiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Citation-backed RAG answers across ICC materials</li>
                <li className="flex items-center gap-2"><HiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> User analytics dashboard for search and engagement trends</li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => archRef.current?.scrollIntoView({ behavior: "smooth" })} className={`${styles.button} text-sm font-medium text-white`}>View Technical Architecture</button>
                <button onClick={() => demoRef.current?.scrollIntoView({ behavior: "smooth" })} className={`${styles.button} inverted text-sm font-medium`}>Launch Demo Chat</button>
              </div>
            </div>
            {/* Proposal summary card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:w-[320px] shrink-0 bg-foreground/[0.04] border border-foreground/10 rounded-2xl p-6 space-y-3"
            >
              <p className="text-[10px] uppercase tracking-widest text-accent font-semibold">Proposal Summary</p>
              {[
                { k: "Delivery", v: "Custom RAG Assistant + Analytics Dashboard" },
                { k: "Deployment", v: "Embedded within ICC site" },
                { k: "Investment", v: PRICING.investment },
                { k: "Scope", v: "MVP · 4–6 weeks" },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-foreground/45">{k}</span>
                  <span className="font-medium text-foreground">{v}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2 — PROBLEM ═════════════════════════════════════════════ */}
      <section className="border-b border-foreground/5">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2 text-center">The Opportunity</p>
          <h3 className="text-xl font-semibold text-center mb-8">Why ICC Needs an AI-Assisted Code Search Layer</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROBLEM_CARDS.map(c => (
              <div key={c.title} className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15 text-accent mb-3">{ICON_MAP[c.icon]}</div>
                <p className="text-sm font-semibold text-foreground mb-1.5">{c.title}</p>
                <p className="text-xs text-foreground/55 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3 — SOLUTION OVERVIEW ═══════════════════════════════════ */}
      <section className="border-b border-foreground/5">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2 text-center">Solution</p>
          <h3 className="text-xl font-semibold text-center mb-3">How the ICC AI Assistant Works</h3>
          <p className="text-sm text-foreground/50 text-center max-w-2xl mx-auto mb-10">
            A custom RAG layer that sits inside ICC&rsquo;s current website experience. Users ask questions in plain English; the system retrieves, ranks, and generates citation-backed answers while logging analytics.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ARCHITECTURE_BLOCKS.map((b, i) => (
              <div key={b.label} className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-4 relative">
                <span className="text-[10px] text-accent font-bold">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-xs font-semibold text-foreground mt-1 mb-1">{b.label}</p>
                <p className="text-[11px] text-foreground/45 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4 — DEMO CHAT ══════════════════════════════════════════ */}
      <section ref={demoRef} className="border-b border-foreground/5">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2 text-center">Working Demo</p>
          <h3 className="text-xl font-semibold text-center mb-2">Embedded Assistant Experience</h3>
          <p className="text-xs text-foreground/40 text-center mb-8">This is a live prototype. Ask a question or select a sample prompt below.</p>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Context cards */}
            <div className="lg:w-[240px] shrink-0 space-y-3">
              <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-foreground/35 font-semibold mb-2">Context</p>
                <p className="text-xs text-foreground/55">Code families: IBC, IRC, IECC, IFC, IEBC</p>
                <p className="text-xs text-foreground/55 mt-1">Cycle: 2024</p>
                <p className="text-xs text-foreground/55 mt-1">Mode: Search + FAQs</p>
              </div>
              <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-foreground/35 font-semibold mb-2">Sample Prompts</p>
                <div className="space-y-1.5">
                  {PROMPT_CHIPS.map(p => (
                    <button key={p} onClick={() => handleSend(p)} disabled={streaming} className="w-full text-left px-2.5 py-1.5 text-[11px] text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors leading-snug disabled:opacity-50">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat panel */}
            <div className="flex-1 bg-foreground/[0.02] border border-foreground/10 rounded-2xl flex flex-col min-h-[400px] max-h-[600px]">
              <div className="px-4 py-3 border-b border-foreground/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">ICC AI Code Search Assistant</p>
                  <p className="text-[10px] text-foreground/35">Powered by Atom · RAG · citation-backed</p>
                </div>
                <span className="text-[9px] text-foreground/25 px-2 py-0.5 border border-foreground/10 rounded-full">Prototype</span>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <HiChatBubbleLeftRight className="w-8 h-8 text-foreground/15 mx-auto mb-3" />
                    <p className="text-sm text-foreground/40">Ask a question about ICC codes, proposals, or code families.</p>
                    <p className="text-xs text-foreground/25 mt-1">Select a sample prompt from the left panel to get started.</p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-accent/20 text-foreground"
                        : "bg-foreground/[0.04] border border-foreground/10 text-foreground/85"
                    }`}>
                      {m.role === "assistant" ? (
                        <div className="prose prose-invert prose-sm max-w-none [&_strong]:text-accent [&_p]:mb-2 [&_ul]:mb-2 [&_li]:mb-0.5" dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*\[Source: ([^\]]+)\]\*\*/g, '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">📖 $1</span>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                      ) : m.content}
                    </div>
                  </div>
                ))}
                {streaming && (
                  <div className="flex items-center gap-2 text-xs text-foreground/35">
                    <span className="animate-pulse">●</span> Generating response...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="border-t border-foreground/10 px-4 py-3 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Ask about ICC codes, proposals, or sections..."
                  disabled={streaming}
                  className="flex-1 h-10 px-4 rounded-xl text-sm bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent/50 disabled:opacity-50"
                />
                <button onClick={() => handleSend()} disabled={streaming || !input.trim()} className="h-10 w-10 flex items-center justify-center rounded-xl bg-accent text-white hover:bg-secondary transition-colors disabled:opacity-30">
                  <HiPaperAirplane className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5 — TECHNICAL ARCHITECTURE ═════════════════════════════ */}
      <section ref={archRef} className="border-b border-foreground/5">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2 text-center">Architecture</p>
          <h3 className="text-xl font-semibold text-center mb-8">Technical Architecture Detail</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {ARCHITECTURE_DETAILS.map(sec => (
              <div key={sec.title} className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-5">
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">{sec.title}</p>
                <ul className="space-y-1.5">
                  {sec.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-foreground/65 leading-relaxed">
                      <HiCheckCircle className="w-3.5 h-3.5 text-emerald-400/70 shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6 — ANALYTICS DASHBOARD ════════════════════════════════ */}
      <section className="border-b border-foreground/5">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2 text-center">Analytics</p>
          <h3 className="text-xl font-semibold text-center mb-3">User Analytics Dashboard Preview</h3>
          <p className="text-xs text-foreground/45 text-center max-w-xl mx-auto mb-10">
            This analytics layer gives ICC visibility into what users are actually trying to solve, which content categories drive the most engagement, and where search experiences should be improved.
          </p>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {DASHBOARD_METRICS.map(m => (
              <div key={m.label} className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
                {m.change && (
                  <span className={`text-[10px] font-medium ${m.trend === "up" ? "text-emerald-400" : m.trend === "down" ? "text-emerald-400" : "text-foreground/40"}`}>
                    {m.change}
                  </span>
                )}
                <p className="text-[10px] text-foreground/40 mt-1 uppercase tracking-wider">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Bar charts */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-5">
              <p className="text-xs font-semibold text-foreground mb-4">Top Code Families (% of queries)</p>
              <MiniBar data={TOP_CODE_FAMILIES} />
            </div>
            <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-5">
              <p className="text-xs font-semibold text-foreground mb-4">Top Search Topics (% of queries)</p>
              <MiniBar data={TOP_SEARCH_TOPICS} color="bg-secondary" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7 — MVP SCOPE ══════════════════════════════════════════ */}
      <section className="border-b border-foreground/5">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2 text-center">Scope</p>
          <h3 className="text-xl font-semibold text-center mb-8">MVP Scope for Initial Deployment</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">In Scope — MVP</p>
              <ul className="space-y-2">
                {MVP_SCOPE.map(s => (
                  <li key={s.label} className="flex items-start gap-2 text-sm text-foreground/70">
                    <HiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> {s.label}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground/30 uppercase tracking-wider mb-3">Future Expansion</p>
              <ul className="space-y-2">
                {FUTURE_SCOPE.map(s => (
                  <li key={s.label} className="flex items-start gap-2 text-sm text-foreground/40">
                    <HiArrowPath className="w-4 h-4 shrink-0 mt-0.5" /> {s.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 8 — USE CASES ══════════════════════════════════════════ */}
      <section className="border-b border-foreground/5">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2 text-center">Use Cases</p>
          <h3 className="text-xl font-semibold text-center mb-8">Core Value Delivered</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {USE_CASES.map((uc, i) => (
              <div key={uc.title} className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/15 text-accent text-xs font-bold mb-3">{i + 1}</div>
                <p className="text-sm font-semibold text-foreground mb-2">{uc.title}</p>
                <p className="text-xs text-foreground/55 leading-relaxed">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 9 — PRICING ════════════════════════════════════════════ */}
      <section className="border-b border-foreground/5">
        <div className="max-w-3xl mx-auto px-5 py-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2 text-center">Investment</p>
          <h3 className="text-xl font-semibold text-center mb-8">Proposal Summary</h3>
          <div className="bg-foreground/[0.04] border border-accent/20 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <p className="text-lg font-bold text-foreground">{PRICING.solution}</p>
                <p className="text-xs text-foreground/50 mt-1 max-w-md">{PRICING.includes}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-accent">{PRICING.investment}</p>
                <p className="text-xs text-foreground/40 mt-1 flex items-center gap-1 justify-end"><HiClock className="w-3 h-3" /> {PRICING.timeline}</p>
              </div>
            </div>
            <p className="text-[11px] text-foreground/40 leading-relaxed border-t border-foreground/10 pt-4">{PRICING.note}</p>
            <div className="mt-6 flex justify-center">
              <a href="mailto:contact@antimatterai.com?subject=ICC%20AI%20Assistant%20—%20Implementation%20Discussion" className={`${styles.button} text-sm font-medium text-white`}>
                Discuss Implementation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 10 — CTA ═══════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h3 className="text-xl md:text-2xl font-bold mb-3">
            Bring a citation-backed AI assistant into ICC&rsquo;s existing digital experience.
          </h3>
          <p className="text-sm text-foreground/50 mb-8 leading-relaxed">
            From natural-language code search to user analytics and proposal research support — scoped, built, and deployed in weeks.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="mailto:contact@antimatterai.com?subject=ICC%20Solution%20Review" className={`${styles.button} text-sm font-medium text-white`}>
              Schedule Solution Review
            </a>
            <button onClick={() => demoRef.current?.scrollIntoView({ behavior: "smooth" })} className={`${styles.button} inverted text-sm font-medium`}>
              Explore Working Prototype
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-foreground/5 py-6 text-center">
        <p className="text-[10px] text-foreground/25">Antimatter AI · Atom IntentIQ · ICC Proposal · Confidential</p>
      </footer>
    </div>
  );
}
