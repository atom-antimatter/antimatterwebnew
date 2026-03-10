"use client";

import { useState, useRef, useEffect } from "react";
import styles from "@/components/ui/css/Button.module.css";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  HiArrowLeft, HiChevronDown, HiChevronUp,
  HiDocumentText, HiMagnifyingGlass, HiChatBubbleLeftRight,
  HiAcademicCap, HiArrowPath, HiClipboardDocument,
  HiCheckCircle, HiExclamationTriangle, HiHandThumbUp, HiHandThumbDown,
  HiArrowDownTray, HiLink, HiBookOpen,
} from "react-icons/hi2";
import {
  SAMPLE_PROMPTS,
  SAMPLE_RESPONSES,
  SAMPLE_REPORT_TITLE,
  SAMPLE_REPORT_OVERVIEW,
  SAMPLE_REPORT_SECTIONS,
  PROPOSAL_STEPS,
  ESTIMATES,
  MONTHLY_RUN_COST,
  MONTHLY_RUN_NOTE,
  DISCOVERY_SECTIONS,
  WORKSPACE_TABS,
  type WorkspaceTab,
  type ICCSampleResponse,
  type ICCCitation,
} from "@/data/iccIntentDemo";

// ─── Citation pill ────────────────────────────────────────────────────────────

function CitationPill({ cite }: { cite: ICCCitation }) {
  const color = cite.confidence === "high" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
    : cite.confidence === "medium" ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
    : "text-red-400 border-red-400/30 bg-red-400/10";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md border ${color}`}>
      <HiBookOpen className="w-3 h-3 shrink-0" />
      {cite.source}{cite.section ? ` — ${cite.section}` : ""}
    </span>
  );
}

// ─── Response card ────────────────────────────────────────────────────────────

function ResponseCard({ resp }: { resp: ICCSampleResponse }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-5">
      <p className="text-xs text-secondary mb-2 uppercase tracking-wider font-semibold">
        {resp.category === "process" ? "Process Guidance" : resp.category === "code-search" ? "Code Search" : "Process + Code Search"}
      </p>
      <p className="text-[13px] font-medium text-foreground/70 mb-3 italic">&ldquo;{resp.prompt}&rdquo;</p>
      <p className="text-sm text-foreground/90 leading-relaxed">{resp.shortAnswer}</p>

      {resp.clarificationNeeded && (
        <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <HiExclamationTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/90 leading-relaxed">{resp.clarificationNeeded}</p>
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-foreground/70 leading-relaxed mt-3 whitespace-pre-line">{resp.expandedDetail}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="mt-3 flex items-center gap-1 text-xs text-secondary hover:text-tertiary transition-colors"
      >
        {expanded ? <HiChevronUp className="w-3.5 h-3.5" /> : <HiChevronDown className="w-3.5 h-3.5" />}
        {expanded ? "Show less" : "Show more detail"}
      </button>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {resp.citations.map((c, i) => <CitationPill key={i} cite={c} />)}
      </div>

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-foreground/5">
        <button className="flex items-center gap-1 text-xs text-foreground/40 hover:text-emerald-400 transition-colors"><HiHandThumbUp className="w-3.5 h-3.5" /> Helpful</button>
        <button className="flex items-center gap-1 text-xs text-foreground/40 hover:text-red-400 transition-colors"><HiHandThumbDown className="w-3.5 h-3.5" /> Not helpful</button>
      </div>
    </div>
  );
}

// ─── Prompt chips ─────────────────────────────────────────────────────────────

function PromptChips({ onSelect }: { onSelect: (label: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SAMPLE_PROMPTS.slice(0, 6).map((p) => (
        <button
          key={p.label}
          onClick={() => onSelect(p.label)}
          className="px-3 py-1.5 text-xs bg-foreground/5 hover:bg-accent hover:text-black border border-foreground/10 rounded-lg transition-colors"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ─── Discovery sidebar ────────────────────────────────────────────────────────

function DiscoverySidebar({ onPromptSelect }: { onPromptSelect: (label: string) => void }) {
  const [selections, setSelections] = useState<Record<string, string>>({});

  return (
    <div className="space-y-5">
      {DISCOVERY_SECTIONS.map((sec) => (
        <div key={sec.id}>
          <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold mb-2">{sec.title}</p>
          {sec.type === "chips" && sec.options && (
            <div className="flex flex-wrap gap-1.5">
              {sec.options.map((opt) => {
                const active = selections[sec.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setSelections(s => ({ ...s, [sec.id]: active ? "" : opt }))}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${active ? "bg-accent text-white border-accent" : "bg-foreground/5 text-foreground/70 border-foreground/10 hover:border-foreground/25"}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <div className="border-t border-foreground/10 pt-4">
        <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold mb-2">Suggested prompts</p>
        <div className="space-y-1.5">
          {SAMPLE_PROMPTS.slice(0, 5).map((p) => (
            <button
              key={p.label}
              onClick={() => onPromptSelect(p.label)}
              className="w-full text-left px-3 py-2 text-xs text-foreground/65 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors leading-snug"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Report preview ───────────────────────────────────────────────────────────

function ReportPreview() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">{SAMPLE_REPORT_TITLE}</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-foreground/5 border border-foreground/10 rounded-lg hover:bg-foreground/10 transition-colors">
            <HiArrowDownTray className="w-3.5 h-3.5" /> Export DOCX
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-foreground/5 border border-foreground/10 rounded-lg hover:bg-foreground/10 transition-colors">
            <HiLink className="w-3.5 h-3.5" /> Copy Link
          </button>
        </div>
      </div>

      <p className="text-sm text-foreground/70 leading-relaxed">{SAMPLE_REPORT_OVERVIEW}</p>

      <div className="space-y-3">
        {SAMPLE_REPORT_SECTIONS.map((sec, i) => (
          <div key={i} className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">{sec.codebook}</span>
              <span className="text-foreground/20">·</span>
              <span className="text-[10px] text-foreground/45">{sec.chapter}</span>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{sec.section} — {sec.title}</p>
            <p className="text-xs text-foreground/60 leading-relaxed mb-2">{sec.summary}</p>
            <blockquote className="text-xs text-foreground/45 italic border-l-2 border-accent/30 pl-3">
              {sec.snippet}
            </blockquote>
          </div>
        ))}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <p className="text-xs text-amber-300/90 leading-relaxed">
          <strong>Disclaimer:</strong> This report is generated for research and drafting purposes only. It is not an authoritative interpretation of ICC codes. Official ICC publications and code text govern all compliance determinations.
        </p>
      </div>
    </div>
  );
}

// ─── Proposal flow ────────────────────────────────────────────────────────────

function ProposalFlow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {PROPOSAL_STEPS.map((step, i) => (
        <div key={step.id} className="relative bg-foreground/[0.03] border border-foreground/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent text-[10px] font-bold">{i + 1}</span>
            <p className="text-xs font-semibold text-foreground">{step.title}</p>
          </div>
          <p className="text-[11px] text-foreground/55 leading-relaxed">{step.description}</p>
          {i < PROPOSAL_STEPS.length - 1 && (
            <div className="hidden lg:block absolute top-1/2 -right-2 w-4 text-foreground/15 text-sm">→</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Estimate cards ───────────────────────────────────────────────────────────

function EstimateCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {ESTIMATES.map((est) => (
        <div key={est.label} className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground mb-0.5">{est.range}</p>
          <p className="text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">{est.unit}</p>
          <p className="text-xs font-medium text-foreground/80">{est.label}</p>
          <p className="text-[10px] text-foreground/40 mt-1 leading-snug">{est.note}</p>
        </div>
      ))}

      <div className="col-span-2 md:col-span-4 bg-foreground/[0.03] border border-foreground/10 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Estimated Monthly Run Cost</p>
          <p className="text-[11px] text-foreground/50 mt-0.5">{MONTHLY_RUN_NOTE}</p>
        </div>
        <p className="text-xl font-bold text-accent">{MONTHLY_RUN_COST}</p>
      </div>
    </div>
  );
}

// ─── Use case cards ───────────────────────────────────────────────────────────

function UseCaseCards() {
  const cases = [
    {
      icon: <HiChatBubbleLeftRight className="w-5 h-5" />,
      title: "FAQ + Code Search Assistant",
      who: "ICC members, code officials, design professionals",
      what: "A single combined assistant that answers process questions, suggests codebooks and sections, and routes intelligently between FAQ and code search.",
      mvp: ["Concise default answers with 'show more'", "Visible citations on every response", "Low-confidence clarification handling", "Context-aware (role, jurisdiction, cycle)"],
      future: ["Proposal-linked actions", "Saved answer bookmarks", "Admin analytics dashboard"],
    },
    {
      icon: <HiDocumentText className="w-5 h-5" />,
      title: "AI Research Report Generator",
      who: "Proposal authors, researchers, committee members",
      what: "Enter a topic once and generate a structured report summarizing relevant codebooks, chapters, and sections with citations and snippets.",
      mvp: ["Free-text query with optional filters", "Report grouped by codebook/chapter/section", "DOCX export concept", "Permanent saved-link / report ID"],
      future: ["Collaborative editing", "Version comparison", "Jurisdiction overlay analysis"],
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {cases.map((c) => (
        <div key={c.title} className="bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15 text-accent">{c.icon}</div>
            <h3 className="text-base font-semibold text-foreground">{c.title}</h3>
          </div>
          <p className="text-xs text-foreground/50">For: {c.who}</p>
          <p className="text-sm text-foreground/75 leading-relaxed">{c.what}</p>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-secondary font-semibold mb-1.5">MVP includes</p>
            <ul className="space-y-1">
              {c.mvp.map((m) => (
                <li key={m} className="flex items-start gap-2 text-xs text-foreground/65">
                  <HiCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> {m}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-foreground/30 font-semibold mb-1.5">Future expansion</p>
            <ul className="space-y-1">
              {c.future.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-foreground/40">
                  <HiArrowPath className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Hero with mouse-tracking radial glow ─────────────────────────────────────

function HeroSection({ demoRef }: { demoRef: React.RefObject<HTMLDivElement | null> }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-foreground/5"
      style={{
        background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(162, 163, 233, 0.15), transparent 40%)`,
      }}
    >
      <div className="max-w-5xl mx-auto px-5 py-16 md:py-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-3"
        >
          Atom IntentIQ
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4"
        >
          ICC AI FAQs, Code Search<br className="hidden sm:block" /> &amp; Research Reports
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-sm md:text-base text-foreground/60 max-w-2xl mx-auto leading-relaxed mb-8"
        >
          A citation-backed AI workspace for proposal guidance, code search, and structured research across ICC codebooks and lifecycle documents.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 text-xs text-foreground/50 mb-8"
        >
          {["RAG over FAQs & codebooks", "Proposal lifecycle guidance", "Citation-backed code search", "Research report generation"].map((t) => (
            <span key={t} className="px-3 py-1.5 rounded-full border border-foreground/10 bg-foreground/[0.03]">{t}</span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-center gap-3"
        >
          <button
            onClick={() => demoRef.current?.scrollIntoView({ behavior: "smooth" })}
            className={`${styles.button} text-sm font-medium text-white`}
          >
            Launch ICC Demo
          </button>
          <a href="#proposal-logic" className={`${styles.button} inverted text-sm font-medium`}>
            View Proposal Logic
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ICCIntentClient() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("Assistant");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const demoRef = useRef<HTMLDivElement>(null);

  const matchedResponse = selectedPrompt
    ? SAMPLE_RESPONSES.find(r => r.prompt === selectedPrompt) ?? SAMPLE_RESPONSES[0]
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Sticky header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-5 border-b border-foreground/10 bg-background/90 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <Link href="/atom-intentiq" className="flex items-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors">
            <HiArrowLeft className="w-3.5 h-3.5" /> Back to Atom
          </Link>
          <span className="text-foreground/15">|</span>
          <h1 className="text-sm font-semibold">Atom IntentIQ <span className="text-accent">for ICC</span></h1>
        </div>
        <span className="text-[10px] text-foreground/30 hidden sm:block">Proposal Demo · Not for Distribution</span>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <HeroSection demoRef={demoRef} />


      {/* ── Interactive Demo Shell ────────────────────────────────────────── */}
      <section ref={demoRef} className="border-b border-foreground/5">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2 text-center">Interactive Demo</p>
          <h3 className="text-xl font-semibold text-center mb-8">ICC AI Workspace</h3>

          <div className="flex flex-col lg:flex-row gap-4 min-h-[600px]">

            {/* Left discovery rail */}
            <aside className={`lg:w-[300px] shrink-0 bg-foreground/[0.02] border border-foreground/10 rounded-2xl p-4 overflow-y-auto ${sidebarOpen ? "" : "hidden lg:block"}`}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-foreground/70">Discovery</p>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-xs text-foreground/40">Close</button>
              </div>
              <DiscoverySidebar onPromptSelect={setSelectedPrompt} />
            </aside>

            {/* Main workspace */}
            <div className="flex-1 bg-foreground/[0.02] border border-foreground/10 rounded-2xl overflow-hidden flex flex-col">

              {/* Tabs */}
              <div className="flex border-b border-foreground/10 shrink-0 overflow-x-auto">
                {WORKSPACE_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? "text-foreground border-accent" : "text-foreground/45 border-transparent hover:text-foreground/70"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Workspace header */}
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {activeTab === "Assistant" && "Combined FAQ & Code Search"}
                    {activeTab === "Code Search" && "Code Search"}
                    {activeTab === "Research Report" && "Research Report Generator"}
                    {activeTab === "Proposal Logic" && "Proposal Lifecycle"}
                  </p>
                  <p className="text-[10px] text-foreground/35 mt-0.5">Powered by Atom · RAG · citation-backed · context-aware routing</p>
                </div>
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden px-3 py-1.5 text-xs bg-foreground/5 border border-foreground/10 rounded-lg">Filters</button>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto px-5 pb-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === "Assistant" && (
                      <div className="space-y-4">
                        {!selectedPrompt && (
                          <>
                            <p className="text-sm text-foreground/55 leading-relaxed mt-2">
                              Ask about proposal processes, search codebooks, or get guidance on code requirements. Choose a prompt or type your own question.
                            </p>
                            <PromptChips onSelect={setSelectedPrompt} />
                          </>
                        )}
                        {matchedResponse && <ResponseCard resp={matchedResponse} />}
                        {selectedPrompt && (
                          <div className="flex gap-2 pt-2">
                            <PromptChips onSelect={setSelectedPrompt} />
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === "Code Search" && (
                      <div className="space-y-4">
                        <p className="text-sm text-foreground/55 mt-2">Search across ICC codebooks by topic, section number, or keyword.</p>
                        <PromptChips onSelect={(l) => { setSelectedPrompt(l); setActiveTab("Assistant"); }} />
                        {SAMPLE_RESPONSES.filter(r => r.category === "code-search").map(r => <ResponseCard key={r.id} resp={r} />)}
                      </div>
                    )}
                    {activeTab === "Research Report" && <ReportPreview />}
                    {activeTab === "Proposal Logic" && <ProposalFlow />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Proposal Logic ───────────────────────────────────────────────── */}
      <section id="proposal-logic" className="border-b border-foreground/5">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2 text-center">Workflow Intelligence</p>
          <h3 className="text-xl font-semibold text-center mb-3">ICC Proposal Lifecycle</h3>
          <p className="text-sm text-foreground/50 text-center max-w-xl mx-auto mb-10">
            Atom IntentIQ understands the full ICC proposal workflow, guiding members through each stage with context-aware responses.
          </p>
          <ProposalFlow />
        </div>
      </section>

      {/* ── Use Cases ────────────────────────────────────────────────────── */}
      <section className="border-b border-foreground/5">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2 text-center">Core Use Cases</p>
          <h3 className="text-xl font-semibold text-center mb-8">What the MVP Delivers</h3>
          <UseCaseCards />
        </div>
      </section>

      {/* ── Architecture ─────────────────────────────────────────────────── */}
      <section className="border-b border-foreground/5">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2 text-center">Technical Foundation</p>
          <h3 className="text-xl font-semibold text-center mb-8">MVP Architecture</h3>
          <div className="bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-6">
            <p className="text-sm text-foreground/75 leading-relaxed">
              This MVP combines semantic retrieval, code-family ranking, proposal lifecycle intelligence, and citation-backed answer generation into a single member-facing experience. The initial release is read-only, focused on guidance, discovery, and report generation, with a future path to proposal-linked actions and deeper product integrations.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mt-6">
              {[
                { icon: <HiMagnifyingGlass className="w-4 h-4" />, label: "Semantic retrieval + topic boosting" },
                { icon: <HiClipboardDocument className="w-4 h-4" />, label: "Visible citations on every response" },
                { icon: <HiAcademicCap className="w-4 h-4" />, label: "Ambiguity handling — asks, doesn't guess" },
                { icon: <HiDocumentText className="w-4 h-4" />, label: "Report export & saved links" },
                { icon: <HiChatBubbleLeftRight className="w-4 h-4" />, label: "Feedback loop & helpfulness capture" },
                { icon: <HiCheckCircle className="w-4 h-4" />, label: "ICC-owned proprietary content guardrails" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5 p-3 rounded-xl bg-foreground/[0.02]">
                  <span className="text-accent mt-0.5">{item.icon}</span>
                  <span className="text-xs text-foreground/65 leading-snug">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Estimates ────────────────────────────────────────────────────── */}
      <section className="border-b border-foreground/5">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2 text-center">Planning Estimates</p>
          <h3 className="text-xl font-semibold text-center mb-2">MVP Delivery Scope</h3>
          <p className="text-xs text-foreground/40 text-center mb-8">Planning-grade estimates for initial build, not contractual pricing.</p>
          <EstimateCards />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h3 className="text-xl md:text-2xl font-bold mb-3">
            See how Atom IntentIQ can power ICC&rsquo;s next-generation proposal workflow
          </h3>
          <p className="text-sm text-foreground/50 mb-8 leading-relaxed">
            From proposal lifecycle guidance to citation-backed code discovery and structured research reports — built on ICC&rsquo;s own materials, deployed in weeks.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="mailto:contact@antimatterai.com?subject=ICC%20Working%20Prototype%20Request" className={`${styles.button} text-sm font-medium text-white`}>
              Request Working Prototype
            </a>
            <button onClick={() => demoRef.current?.scrollIntoView({ behavior: "smooth" })} className={`${styles.button} ${styles.inverted} text-sm font-medium`}>
              Review ICC Solution Scope
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer attribution ───────────────────────────────────────────── */}
      <footer className="border-t border-foreground/5 py-6 text-center">
        <p className="text-[10px] text-foreground/25">Antimatter AI · Atom IntentIQ · Proposal Demo for ICC · Confidential</p>
      </footer>
    </div>
  );
}
