/**
 * iccProposalDemo.ts — Seeded content for the ICC proposal page at /atom-intentiq/icc-proposal.
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

export type ArchBlock = { label: string; description: string };
export const ARCHITECTURE_BLOCKS: ArchBlock[] = [
  { label: "ICC Website / Existing UX", description: "The assistant lives within ICC's current digital experience as an embedded component." },
  { label: "Embedded AI Assistant UI", description: "A compact search and chat surface accessible from key pages." },
  { label: "Query Understanding Layer", description: "Interprets user intent, topic, and likely code domains from natural language." },
  { label: "Retrieval / Vector Search", description: "Semantic search over chunked and indexed ICC content with metadata filtering." },
  { label: "ICC Content Index", description: "Codebooks, chapters, sections, FAQs, and lifecycle documents — chunked and embedded." },
  { label: "Response Generation", description: "LLM generates concise answers with inline citations mapped to source content." },
  { label: "Citation / Source Mapping", description: "Every answer references the specific codebook, chapter, and section it draws from." },
  { label: "Analytics & Dashboarding", description: "Tracks searches, topics, engagement, low-confidence queries, and content demand." },
];

export type ArchDetailSection = { title: string; items: string[] };
export const ARCHITECTURE_DETAILS: ArchDetailSection[] = [
  { title: "Content Sources", items: ["Code books (IBC, IRC, IECC, IFC, IMC, IPC, IEBC, ISPSC)", "Structured content (tables, diagrams, references)", "Lifecycle / FAQ / proposal documentation", "Future: additional proprietary content"] },
  { title: "Retrieval Layer", items: ["Chunking and embedding of source documents", "Semantic vector retrieval", "Metadata filters (code cycle, code family, topic)", "Re-ranking and relevance scoring", "Citation mapping to source passages"] },
  { title: "Response Layer", items: ["Concise answer generation with citations", "Ambiguity detection with clarification prompts", "Low-confidence handling: asks, does not guess", "Read-only MVP guardrails"] },
  { title: "Analytics Layer", items: ["Popular search topics and queries", "No-result / weak-result tracking", "Code family demand distribution", "Engagement by topic cluster", "Prompt-to-citation click behavior", "Report generation trends"] },
];

export type DashboardMetric = { label: string; value: string; change?: string; trend?: "up" | "down" | "flat" };
export const DASHBOARD_METRICS: DashboardMetric[] = [
  { label: "Total Searches (30d)", value: "12,847", change: "+18%", trend: "up" },
  { label: "Unique Users", value: "3,241", change: "+9%", trend: "up" },
  { label: "Avg. Citations/Query", value: "2.4", trend: "flat" },
  { label: "Low-Confidence Rate", value: "6.2%", change: "-2.1%", trend: "down" },
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

export type ScopeItem = { label: string; included: boolean };
export const MVP_SCOPE: ScopeItem[] = [
  { label: "Embedded AI assistant UI", included: true },
  { label: "Natural-language search across indexed ICC content", included: true },
  { label: "Citation-backed answers", included: true },
  { label: "Metadata-aware retrieval filters (cycle, family, topic)", included: true },
  { label: "Basic proposal-supporting research summaries", included: true },
  { label: "Analytics dashboard for user / search behavior", included: true },
  { label: "Read-only experience", included: true },
  { label: "Admin-ready event tracking foundation", included: true },
];

export const FUTURE_SCOPE: ScopeItem[] = [
  { label: "Proposal drafting assistance", included: false },
  { label: "Authenticated personalization", included: false },
  { label: "Saved research sessions", included: false },
  { label: "Exportable reports", included: false },
  { label: "Workflow integrations", included: false },
  { label: "Role-based recommendations", included: false },
  { label: "Expanded content ingestion", included: false },
];

export type UseCaseCard = { title: string; description: string };
export const USE_CASES: UseCaseCard[] = [
  { title: "Code Discovery", description: "Help users identify the right books, sections, and related content when they are unsure where to begin." },
  { title: "Proposal Research Support", description: "Help users gather relevant code references and contextual guidance before drafting or updating proposals." },
  { title: "Product Insight for ICC", description: "Give ICC an analytics view into search demand, intent clusters, and content gaps across the member base." },
];

export const PRICING = {
  solution: "ICC Custom AI Assistant MVP",
  includes: "Embedded assistant, retrieval architecture, citation experience, analytics dashboard, seeded content model, proposal-ready demo layer",
  investment: "$32,000",
  timeline: "4–6 weeks",
  note: "Final implementation details and production deployment assumptions can be refined based on ICC's preferred content access model, hosting constraints, and available integration pathways.",
};
