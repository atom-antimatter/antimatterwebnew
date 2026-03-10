/**
 * iccIntentDemo.ts — Seeded demo content for the ICC IntentIQ proposal page.
 *
 * All content is typed and centralized so it can be swapped for real ICC data
 * once the MVP is underway. Nothing here is authoritative — it is demo content
 * for proposal presentation purposes only.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ICCSamplePrompt = {
  label: string;
  category: "process" | "code-search" | "report" | "mixed";
};

export type ICCCitation = {
  source: string;
  section?: string;
  title: string;
  confidence: "high" | "medium" | "low";
};

export type ICCSampleResponse = {
  id: string;
  prompt: string;
  category: "process" | "code-search" | "mixed";
  shortAnswer: string;
  expandedDetail: string;
  citations: ICCCitation[];
  clarificationNeeded?: string;
};

export type ICCReportSection = {
  codebook: string;
  chapter: string;
  section: string;
  title: string;
  summary: string;
  snippet: string;
};

export type ICCProposalStep = {
  id: string;
  title: string;
  description: string;
  status?: "active" | "complete" | "pending";
};

export type ICCEstimateItem = {
  label: string;
  range: string;
  unit: string;
  note: string;
};

// ─── Sample Prompts ───────────────────────────────────────────────────────────

export const SAMPLE_PROMPTS: ICCSamplePrompt[] = [
  { label: "Explain the proposal steps", category: "process" },
  { label: "What happens after committee modifies my proposal?", category: "process" },
  { label: "Which codebooks cover fire alarms?", category: "code-search" },
  { label: "Which codebooks cover residential energy for existing multifamily?", category: "code-search" },
  { label: "Generate a report on zoning-related sections", category: "report" },
  { label: "What happens after public comments are submitted?", category: "process" },
  { label: "Which sections should I review before drafting a proposal?", category: "mixed" },
  { label: "I'm drafting a proposal on residential energy updates — what's the process and what codebooks should I search?", category: "mixed" },
];

// ─── Sample Responses ─────────────────────────────────────────────────────────

export const SAMPLE_RESPONSES: ICCSampleResponse[] = [
  {
    id: "resp-1",
    prompt: "What happens after committee modifies my proposal?",
    category: "process",
    shortAnswer:
      "Once a committee modifies your proposal, the updated version enters a public comment period. After comments are collected, the committee reviews them in a follow-up hearing (typically in the fall cycle). The committee can then approve, further modify, or reject the proposal and its associated comments.",
    expandedDetail:
      "The modification creates a new version of your original submission. This version is published for public review, during which any ICC member or stakeholder can submit formal comments. The comments and modifications are then bundled for a Committee Hearing 2 (CH2), usually scheduled for the fall. At CH2, the committee evaluates all feedback and decides whether to approve the proposal as-modified, request additional changes, or disapprove it. If approved with no further changes, the proposal is queued for inclusion in the next code cycle publication.",
    citations: [
      { source: "ICC Proposal Lifecycle Guide", title: "Section 4.3 — Committee Modification Process", confidence: "high" },
      { source: "ICC FAQ", section: "Process", title: "What happens after my proposal is modified?", confidence: "high" },
    ],
  },
  {
    id: "resp-2",
    prompt: "Which codebooks cover residential energy requirements for existing multifamily buildings?",
    category: "code-search",
    shortAnswer:
      "Residential energy requirements for existing multifamily buildings are primarily covered by the International Energy Conservation Code (IECC) — specifically the residential provisions — and the International Existing Building Code (IEBC) for renovation and alteration scenarios.",
    expandedDetail:
      "The IECC Residential Provisions (Chapter 4) establish baseline energy efficiency requirements including insulation, fenestration, and HVAC standards. For existing buildings undergoing renovations, the IEBC provides compliance paths that reference IECC standards while accounting for the constraints of retrofit work. Additionally, some jurisdictions adopt amendments that modify these requirements, so checking the applicable code cycle and jurisdiction is recommended.",
    citations: [
      { source: "IECC", section: "Chapter 4", title: "Residential Energy Efficiency", confidence: "high" },
      { source: "IEBC", section: "Chapter 5", title: "Alterations — Level 2", confidence: "medium" },
      { source: "IECC", section: "Section R401.2", title: "Compliance Path Options", confidence: "high" },
    ],
  },
  {
    id: "resp-3",
    prompt: "I'm drafting a proposal on residential energy updates — what's the process and what codebooks should I search?",
    category: "mixed",
    shortAnswer:
      "To draft a proposal on residential energy updates, you'll follow the standard ICC proposal submission process and should focus your code research on the IECC Residential Provisions and the IRC Energy chapter.",
    expandedDetail:
      "Process: Start by building your proposal through the ICC online portal. Once submitted, other members can review it and request modifications. Your proposal then enters committee review, where it may be approved, modified, or disapproved. If modifications are made, a public comment period follows before a final hearing.\n\nCode Research: The International Energy Conservation Code (IECC) Residential Provisions — particularly Chapter 4 — cover insulation, air leakage, fenestration, and mechanical requirements. The International Residential Code (IRC) Chapter 11 (Energy Efficiency) also contains energy-related provisions that may overlap or supplement IECC requirements. Search both codebooks for your specific topic area.",
    citations: [
      { source: "ICC Proposal Lifecycle Guide", title: "Section 2 — Proposal Submission", confidence: "high" },
      { source: "IECC", section: "Chapter 4", title: "Residential Energy Efficiency", confidence: "high" },
      { source: "IRC", section: "Chapter 11", title: "Energy Efficiency", confidence: "medium" },
    ],
  },
  {
    id: "resp-4",
    prompt: "Which codebooks cover fire alarms?",
    category: "code-search",
    shortAnswer:
      "Fire alarm systems are primarily covered by the International Fire Code (IFC) and the International Building Code (IBC). NFPA 72 is the referenced standard for fire alarm system design and installation.",
    expandedDetail:
      "The IFC Section 907 establishes when fire alarm systems are required and the general installation requirements. The IBC Section 907 mirrors these requirements for new construction. Both codes reference NFPA 72 (National Fire Alarm and Signaling Code) as the technical standard for design, installation, and maintenance. For specific occupancy types, check the applicable IBC occupancy chapter for additional alarm requirements.",
    citations: [
      { source: "IFC", section: "Section 907", title: "Fire Alarm and Detection Systems", confidence: "high" },
      { source: "IBC", section: "Section 907", title: "Fire Alarm and Detection Systems", confidence: "high" },
      { source: "NFPA 72", title: "National Fire Alarm and Signaling Code (referenced standard)", confidence: "high" },
    ],
  },
  {
    id: "resp-5",
    prompt: "What does 'committee review' mean for my proposal?",
    category: "process",
    shortAnswer:
      "Committee review is the stage where a designated ICC code committee evaluates your proposal's technical merit, consistency with existing code language, and practical impact.",
    expandedDetail:
      "During committee review, subject-matter experts on the relevant code development committee examine your proposal against the current code text, assess its technical justification, and consider any modifications requested by other members during the review period. The committee can approve the proposal as submitted, approve it with modifications, or disapprove it. Their decision is then published along with a reason statement.",
    citations: [
      { source: "ICC Proposal Lifecycle Guide", title: "Section 3 — Committee Action", confidence: "high" },
    ],
    clarificationNeeded: "Which specific code committee or code family is your proposal targeting? This affects the timeline and hearing schedule.",
  },
];

// ─── Sample Report ────────────────────────────────────────────────────────────

export const SAMPLE_REPORT_TITLE = "Residential Energy Requirements — Existing Multifamily Buildings";
export const SAMPLE_REPORT_OVERVIEW =
  "This report summarizes relevant codebook sections related to residential energy efficiency requirements for existing multifamily buildings, covering insulation, HVAC, fenestration, and compliance paths for renovations.";

export const SAMPLE_REPORT_SECTIONS: ICCReportSection[] = [
  {
    codebook: "IECC — Residential",
    chapter: "Chapter 4 — Residential Energy Efficiency",
    section: "R401.2",
    title: "Compliance Path Options",
    summary: "Defines the three available compliance paths for residential energy code: prescriptive, simulated performance, and Energy Rating Index (ERI).",
    snippet: '"Buildings shall comply with Section R401.2.1 (prescriptive), R401.2.2 (simulated performance), or R401.2.3 (Energy Rating Index)."',
  },
  {
    codebook: "IECC — Residential",
    chapter: "Chapter 4 — Residential Energy Efficiency",
    section: "R402.1",
    title: "Insulation and Fenestration Criteria",
    summary: "Establishes minimum insulation R-values and fenestration U-factor requirements by climate zone.",
    snippet: '"Building thermal envelope insulation shall meet the requirements of Table R402.1.2 based on the climate zone."',
  },
  {
    codebook: "IEBC",
    chapter: "Chapter 5 — Alterations — Level 2",
    section: "503.1",
    title: "Alterations Compliance",
    summary: "Requires energy code compliance for alterations that affect the building thermal envelope, HVAC, or lighting systems.",
    snippet: '"Alterations to existing buildings shall comply with the energy conservation requirements of the IECC as applicable to the specific work being performed."',
  },
  {
    codebook: "IRC",
    chapter: "Chapter 11 — Energy Efficiency",
    section: "N1101.2",
    title: "Compliance",
    summary: "Residential buildings within IRC scope shall comply with IECC residential provisions or the IRC Chapter 11 energy provisions.",
    snippet: '"Residential buildings shall comply with this chapter or the International Energy Conservation Code."',
  },
];

// ─── Proposal Workflow ────────────────────────────────────────────────────────

export const PROPOSAL_STEPS: ICCProposalStep[] = [
  { id: "submit", title: "Build & Submit Proposal", description: "Author creates a new proposal through the ICC submission portal with code change justification." },
  { id: "review", title: "Member Review", description: "Other ICC members and stakeholders review the submitted proposal and may request modifications." },
  { id: "modify", title: "Modification Period", description: "If modifications are requested, the proposal is updated and resubmitted as a modified version." },
  { id: "committee", title: "Committee Review", description: "The code development committee evaluates technical merit and votes to approve, modify, or disapprove." },
  { id: "approve-direct", title: "Approved — No Changes", description: "If approved without further changes, the proposal is queued for the next code book publication." },
  { id: "comments", title: "Public Comment Period", description: "Modified proposals are published for public comment collection from all ICC members and stakeholders." },
  { id: "hearing", title: "Committee Hearing (CH2)", description: "A follow-up hearing reviews all comments and modifications. The committee issues a final action." },
  { id: "final", title: "Final Action", description: "The committee approves, modifies, or rejects the proposal and its associated comments. Approved items enter the next code cycle." },
];

// ─── Estimates ────────────────────────────────────────────────────────────────

export const ESTIMATES: ICCEstimateItem[] = [
  { label: "Build Effort", range: "200–275", unit: "hours", note: "Core RAG pipeline, assistant UI, code search, report generation" },
  { label: "Integration", range: "100–130", unit: "hours", note: "ICC data ingestion, authentication, deployment, testing" },
  { label: "Documentation", range: "25–35", unit: "hours", note: "Technical documentation, user guides, admin documentation" },
  { label: "Total One-Time", range: "325–440", unit: "hours", note: "Full MVP delivery including QA and launch support" },
];

export const MONTHLY_RUN_COST = "$600–$1,700 /mo";
export const MONTHLY_RUN_NOTE = "Hosting, inference, embedding refresh, monitoring — varies by usage volume";

// ─── Discovery Sidebar ───────────────────────────────────────────────────────

export type ICCDiscoverySection = {
  id: string;
  title: string;
  options?: string[];
  type: "chips" | "select" | "info";
};

export const DISCOVERY_SECTIONS: ICCDiscoverySection[] = [
  { id: "mode", title: "Ask about", type: "chips", options: ["Process / FAQs", "Search codebooks", "Generate report", "Proposal status"] },
  { id: "cycle", title: "Code cycle", type: "chips", options: ["2024", "2021", "2018", "All cycles"] },
  { id: "family", title: "Code family", type: "chips", options: ["IBC", "IRC", "IECC", "IFC", "IMC", "IPC", "IEBC", "ISPSC"] },
  { id: "role", title: "Member role", type: "chips", options: ["Code official", "Design professional", "Builder / contractor", "Educator", "Other"] },
];

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export const WORKSPACE_TABS = ["Assistant", "Code Search", "Research Report", "Proposal Logic"] as const;
export type WorkspaceTab = (typeof WORKSPACE_TABS)[number];
