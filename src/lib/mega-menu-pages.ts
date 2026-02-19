export interface MegaMenuPage {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  outcomes: string[];
}

export const megaMenuPages: MegaMenuPage[] = [
  {
    slug: "model-agnostic-orchestration",
    title: "Model-agnostic orchestration",
    subtitle: "Capabilities",
    description:
      "Run Grok, Claude, GPT, or mixed-model workflows through one governed execution layer that keeps routing, policy, and observability consistent across teams.",
    highlights: [
      "Unified routing across multiple model providers",
      "Deterministic workflow controls for repeatable execution",
      "Fallback and failover paths for resilient operations",
      "Centralized policy checks before high-risk actions",
    ],
    outcomes: [
      "Lower vendor lock-in risk",
      "Faster production deployment cycles",
      "Consistent behavior across business units",
    ],
  },
  {
    slug: "compliance-ready-by-design",
    title: "Compliance-ready by design",
    subtitle: "Capabilities",
    description:
      "Ship AI workers with compliance controls embedded from day one, including traceable actions, role boundaries, and reviewer-ready evidence trails.",
    highlights: [
      "Policy-aware workflows for regulated operations",
      "Audit-friendly event capture and data lineage",
      "Least-privilege access patterns across systems",
      "Approval gates and escalation paths for sensitive tasks",
    ],
    outcomes: [
      "Reduced security review friction",
      "Clearer audit and governance posture",
      "Improved trust across legal, security, and ops",
    ],
  },
  {
    slug: "full-observability-replay",
    title: "Full observability + replay",
    subtitle: "Capabilities",
    description:
      "Inspect every AI worker decision with replayable traces, execution logs, and exception reporting so teams can diagnose issues quickly and improve safely.",
    highlights: [
      "Replayable execution history for investigations",
      "Structured logs for model and tool interactions",
      "Exception tracking with root-cause context",
      "Operational visibility for product and security teams",
    ],
    outcomes: [
      "Faster incident response",
      "More reliable production behavior",
      "Clear accountability for automated actions",
    ],
  },
  {
    slug: "healthcare-rcm",
    title: "Healthcare + RCM",
    subtitle: "Focus",
    description:
      "Deploy digital workers into healthcare and revenue-cycle workflows where reliability, traceability, and policy enforcement are non-negotiable.",
    highlights: [
      "Workflow support for intake, follow-up, and billing operations",
      "HIPAA-aware handling patterns for sensitive data",
      "Escalation paths for human-in-the-loop review",
      "Operational controls aligned with compliance requirements",
    ],
    outcomes: [
      "Higher throughput in repetitive administrative tasks",
      "More consistent operational quality",
      "Lower risk in production execution",
    ],
  },
  {
    slug: "biotech-operations",
    title: "Biotech operations",
    subtitle: "Focus",
    description:
      "Support complex biotech operating environments with AI coworkers that can execute documented workflows while preserving oversight and governance.",
    highlights: [
      "Structured automation for cross-functional workflows",
      "Traceable execution for regulated process steps",
      "Controlled system integrations across internal tooling",
      "Review and override controls for critical decisions",
    ],
    outcomes: [
      "Faster operational coordination",
      "Greater process consistency",
      "Improved readiness for audits and quality checks",
    ],
  },
  {
    slug: "security-programs",
    title: "Security programs",
    subtitle: "Focus",
    description:
      "Embed AI workers in security operations with guardrails that prioritize least privilege, full logging, and deterministic escalation.",
    highlights: [
      "Policy enforcement for privileged or high-risk workflows",
      "Comprehensive action logging for security analytics",
      "Analyst-in-the-loop approval flows where required",
      "Replay and traceability for post-incident review",
    ],
    outcomes: [
      "Better operational visibility",
      "Faster triage and response support",
      "Stronger governance around automated actions",
    ],
  },
  {
    slug: "mission-critical-saas",
    title: "Mission-critical SaaS",
    subtitle: "Focus",
    description:
      "Operate AI workers in high-stakes SaaS environments where uptime, correctness, and auditability matter as much as model quality.",
    highlights: [
      "Deterministic orchestration for business-critical workflows",
      "Runtime controls to contain failures safely",
      "System integration patterns with governed data access",
      "Operational metrics for reliability and performance",
    ],
    outcomes: [
      "Safer production adoption of AI workflows",
      "Lower operational uncertainty at scale",
      "Clear governance for enterprise stakeholders",
    ],
  },
];

export const megaMenuPageMap = new Map(
  megaMenuPages.map((page) => [page.slug, page])
);
