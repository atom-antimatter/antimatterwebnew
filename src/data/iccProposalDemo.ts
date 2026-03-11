/**
 * iccProposalDemo.ts — Seeded content for the ICC proposal page.
 * All data is typed and swappable for production content.
 */

export const PROMPT_CHIPS = [
  "Which codebooks are relevant to residential energy?",
  "Summarize the proposal workflow after committee review.",
  "Find sections related to fire alarm requirements.",
  "What should I review before drafting a proposal?",
  "Show likely code families for multifamily energy updates.",
];

export type ProblemCard = { title: string; description: string; icon: string };
export const PROBLEM_CARDS: ProblemCard[] = [
  { title: "User Discovery Friction", description: "Members may not know which codebook or code family to search when researching a topic or drafting a proposal.", icon: "search" },
  { title: "Code Search Complexity", description: "Cross-referencing multiple code families, cycles, and sections manually is time-consuming and error-prone.", icon: "code" },
  { title: "Proposal Research Overhead", description: "Gathering the right code references and contextual guidance before drafting a proposal requires significant manual effort.", icon: "document" },
  { title: "Missed Behavior Insight", description: "ICC has limited visibility into what users are searching for, where they get stuck, and which content drives engagement.", icon: "chart" },
];

// ─── Architecture ─────────────────────────────────────────────────────────────

export type ArchBlock = { label: string; description: string };
export const ARCHITECTURE_BLOCKS: ArchBlock[] = [
  { label: "ICC Website / Existing UX", description: "The assistant lives within ICC's current digital experience as an embedded component." },
  { label: "Embedded AI Assistant UI", description: "A compact search and chat surface accessible from key pages." },
  { label: "Query Understanding", description: "Interprets user intent, topic, and likely code domains from natural language." },
  { label: "Retrieval + Relevance Scoring", description: "Semantic search over indexed ICC content with metadata filtering and re-ranking." },
  { label: "ICC Content Index", description: "Codebooks, chapters, sections, FAQs, and lifecycle documents — chunked, embedded, and governed." },
  { label: "Grounded Generation", description: "LLM produces answers constrained to retrieved evidence with inline citation mapping." },
  { label: "Confidence Check + Guardrails", description: "Low-confidence detection triggers clarification instead of speculation. Read-only MVP constraints." },
  { label: "Citation Mapping", description: "Every answer references the specific codebook, chapter, and section it draws from." },
  { label: "Content Governance Layer", description: "Approved source control, freshness rules, and content scope boundaries for retrieval." },
  { label: "Analytics + Quality Monitoring", description: "Tracks searches, citations, confidence levels, weak-result patterns, and engagement." },
];

export type ArchDetailSection = { title: string; items: string[] };
export const ARCHITECTURE_DETAILS: ArchDetailSection[] = [
  {
    title: "Content Sources",
    items: [
      "Code books (IBC, IRC, IECC, IFC, IMC, IPC, IEBC, ISPSC)",
      "Structured content (tables, diagrams, references)",
      "Lifecycle / FAQ / proposal documentation",
      "Future: additional proprietary content",
      "Governed source registry with freshness metadata",
    ],
  },
  {
    title: "Retrieval & Governance",
    items: [
      "Chunking and embedding of approved source documents",
      "Semantic vector retrieval with metadata filters (cycle, family, topic)",
      "Re-ranking and relevance scoring before generation",
      "Citation mapping to source passages with provenance tracking",
      "Content governance layer: approved sources, scope boundaries, freshness rules",
    ],
  },
  {
    title: "Response & Quality Controls",
    items: [
      "Grounded generation constrained to retrieved evidence",
      "Citation-backed answer output with source attribution",
      "Confidence-aware behavior: clarification before speculation",
      "Ambiguity detection with clarifying prompts",
      "Read-only MVP guardrails — non-authoritative answer framing",
      "Answer quality observability for review and tuning",
    ],
  },
  {
    title: "Analytics & Data Quality",
    items: [
      "Popular search topics and query patterns",
      "No-result / weak-result tracking and alerting",
      "Citation coverage rate and grounded answer rate",
      "Low-confidence query monitoring",
      "Code family demand and content gap identification",
      "Retrieval quality trends over time",
    ],
  },
];

export const GOVERNANCE_CONTROLS = [
  "Approved content source control — only indexed ICC-controlled materials are retrievable",
  "Read-only MVP guardrails — the assistant provides guidance, not authoritative interpretation",
  "Citation requirement — every answer must reference its source passage",
  "Low-confidence fallback — the system asks clarifying questions instead of guessing",
  "Quality instrumentation — retrieval accuracy, citation coverage, and user feedback are tracked",
  "Content freshness governance — source metadata tracks indexing recency and cycle alignment",
];

// ─── Dashboard ────────────────────────────────────────────────────────────────

export type DashboardMetric = { label: string; value: string; change?: string; trend?: "up" | "down" | "flat" };
export const DASHBOARD_METRICS: DashboardMetric[] = [
  { label: "Total Searches (30d)", value: "12,847", change: "+18%", trend: "up" },
  { label: "Unique Users", value: "3,241", change: "+9%", trend: "up" },
  { label: "Avg. Citations/Query", value: "2.4", trend: "flat" },
  { label: "Low-Confidence Rate", value: "6.2%", change: "-2.1%", trend: "down" },
];

export const QUALITY_METRICS: DashboardMetric[] = [
  { label: "Citation Coverage", value: "94.8%", change: "+1.2%", trend: "up" },
  { label: "Grounded Answer Rate", value: "91.3%", change: "+0.8%", trend: "up" },
  { label: "No-Result Rate", value: "3.1%", change: "-0.4%", trend: "down" },
  { label: "Clarification Prompt Rate", value: "8.7%", trend: "flat" },
];

export type DashboardBar = { label: string; value: number };
export const TOP_CODE_FAMILIES: DashboardBar[] = [
  { label: "IBC", value: 34 },
  { label: "IECC", value: 22 },
  { label: "IRC", value: 18 },
  { label: "IFC", value: 12 },
  { label: "IEBC", value: 8 },
  { label: "IMC", value: 4 },
  { label: "IPC", value: 2 },
];

export const TOP_SEARCH_TOPICS: DashboardBar[] = [
  { label: "Residential energy", value: 28 },
  { label: "Fire alarm systems", value: 19 },
  { label: "Structural requirements", value: 15 },
  { label: "Proposal workflow", value: 12 },
  { label: "Accessibility / ADA", value: 10 },
  { label: "Plumbing fixtures", value: 9 },
  { label: "Existing buildings", value: 7 },
];

export const WEAK_RESULT_TOPICS: DashboardBar[] = [
  { label: "Cross-code references", value: 22 },
  { label: "Jurisdiction amendments", value: 18 },
  { label: "Historical code changes", value: 14 },
  { label: "Diagram interpretation", value: 11 },
  { label: "Multi-family exceptions", value: 9 },
];

// ─── Scope ────────────────────────────────────────────────────────────────────

export type ScopeItem = { label: string; included: boolean };
export const MVP_SCOPE: ScopeItem[] = [
  { label: "Embedded AI assistant UI within ICC's current site experience", included: true },
  { label: "Natural-language search across indexed ICC content", included: true },
  { label: "Citation-backed answer generation with source attribution", included: true },
  { label: "Governed retrieval over approved ICC content sources", included: true },
  { label: "Confidence-aware response behavior with clarification prompts", included: true },
  { label: "Metadata-aware retrieval filters (cycle, family, topic)", included: true },
  { label: "Analytics dashboard for usage, search behavior, and answer quality", included: true },
  { label: "Answer/source observability foundation for quality review", included: true },
  { label: "Read-only trust-first MVP design — non-authoritative guardrails", included: true },
];

export const FUTURE_SCOPE: ScopeItem[] = [
  { label: "Answer quality review workflows and evaluator dashboards", included: false },
  { label: "Content approval and source governance admin tooling", included: false },
  { label: "Human-in-the-loop tuning and retrieval quality optimization", included: false },
  { label: "Authenticated personalization and saved research sessions", included: false },
  { label: "Exportable research reports and proposal drafting assistance", included: false },
  { label: "Role-based trust policies and access controls", included: false },
  { label: "Content freshness monitoring and re-indexing automation", included: false },
  { label: "Expanded proprietary content ingestion", included: false },
];

// ─── Use cases ────────────────────────────────────────────────────────────────

export type UseCaseCard = { title: string; description: string };
export const USE_CASES: UseCaseCard[] = [
  { title: "Code Discovery", description: "Help users identify the right books, sections, and related content when they are unsure where to begin." },
  { title: "Proposal Research Support", description: "Help users gather relevant code references and contextual guidance before drafting or updating proposals." },
  { title: "Product Insight for ICC", description: "Give ICC an analytics view into search demand, retrieval quality, intent clusters, and content gaps across the member base." },
];

// ─── Pricing ──────────────────────────────────────────────────────────────────

export const PRICING = {
  solution: "ICC Custom AI Assistant MVP",
  includes: "Embedded assistant, governed retrieval architecture, citation experience, analytics + quality dashboard, seeded content model, proposal-ready demo layer",
  investment: "$32,000",
  timeline: "4–6 weeks",
  note: "Final implementation details and production deployment assumptions can be refined based on ICC's preferred content access model, hosting constraints, and available integration pathways.",
};

// ─── Executive summary badges ─────────────────────────────────────────────────

export const SUMMARY_BADGES = [
  "Citation-backed",
  "Governed retrieval",
  "Read-only MVP",
  "Analytics included",
  "Confidence-aware",
];
