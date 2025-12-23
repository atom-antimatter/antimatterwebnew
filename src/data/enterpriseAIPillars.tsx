import { 
  HiShieldCheck, 
  HiLockClosed, 
  HiKey, 
  HiDocumentCheck, 
  HiNoSymbol,
  HiCube,
  HiDocumentText,
  HiArrowDownTray,
  HiCircleStack,
  HiUserGroup,
  HiCog,
  HiBolt,
  HiLink,
  HiBookOpen,
  HiSparkles,
  HiServer,
  HiCodeBracket,
  HiCpuChip,
  HiCloud,
  HiVariable
} from "react-icons/hi2";

export interface EnterpriseAIPillarCardProps {
  title: string;
  number: string;
  active?: boolean;
  description?: string;
  iconLabel?: string;
  features?: Array<{
    icon: React.ReactNode;
    label: string;
    tooltip: string;
  }>;
}

export const enterpriseAIPillarData: EnterpriseAIPillarCardProps[] = [
  {
    number: "01",
    title: "Security & Compliance",
    description:
      "Deploy with strict isolation across VPC, hybrid, or on‑prem. Encrypt data in transit and at rest, with audit logs and private networking.",
    iconLabel: "Security Controls",
    features: [
      {
        icon: <HiLockClosed key="encryption" />,
        label: "Encrypt at rest",
        tooltip: "Encryption in transit and at rest",
      },
      {
        icon: <HiShieldCheck key="networking" />,
        label: "Private network",
        tooltip: "VPC / private network isolation supported",
      },
      {
        icon: <HiKey key="sso" />,
        label: "SSO + RBAC",
        tooltip: "SSO + role-based access controls",
      },
      {
        icon: <HiDocumentCheck key="audit" />,
        label: "Audit logs",
        tooltip: "Auditable access and activity trails",
      },
      {
        icon: <HiNoSymbol key="training" />,
        label: "Zero training",
        tooltip: "Customer data is never used for training",
      },
    ],
  },
  {
    number: "02",
    title: "IP Ownership",
    description:
      "You own prompts, agents, workflows, and outputs. Atom does not train on your data or resell metadata. Set retention and export rules per environment.",
    iconLabel: "Ownership Controls",
    features: [
      {
        icon: <HiCube key="ip" />,
        label: "Customer IP",
        tooltip: "Customer-owned prompts, workflows, and agent logic",
      },
      {
        icon: <HiUserGroup key="tenant" />,
        label: "Hard isolation",
        tooltip: "Hard isolation between tenants/environments",
      },
      {
        icon: <HiArrowDownTray key="export" />,
        label: "Export configs",
        tooltip: "Export workflows, prompts, and agent configs",
      },
      {
        icon: <HiCircleStack key="retention" />,
        label: "Retention policy",
        tooltip: "Configurable retention & deletion",
      },
      {
        icon: <HiDocumentText key="pools" />,
        label: "No shared pools",
        tooltip: "No shared prompt pools or cross-tenant learning",
      },
    ],
  },
  {
    number: "03",
    title: "Framework, Not a Tool",
    description:
      "Build composable systems for voice, search, workflows, and decisions. Reuse modules across teams and evolve without rewrites. Add tools and data sources with policy.",
    iconLabel: "Core Modules",
    features: [
      {
        icon: <HiCog key="agents" />,
        label: "Agents",
        tooltip: "Composable agents for different jobs",
      },
      {
        icon: <HiBolt key="orchestration" />,
        label: "Orchestration",
        tooltip: "Deterministic orchestration layer",
      },
      {
        icon: <HiLink key="tools" />,
        label: "Tool calls",
        tooltip: "Secure tool execution with policy",
      },
      {
        icon: <HiBookOpen key="rag" />,
        label: "Retrieval",
        tooltip: "Grounded retrieval over your sources",
      },
      {
        icon: <HiSparkles key="genui" />,
        label: "Deterministic UI",
        tooltip: "Dynamic UI generated from structured outputs",
      },
    ],
  },
  {
    number: "04",
    title: "Model-Agnostic Runtime",
    description:
      "Swap model providers without changing your product logic. Run hosted, open-source, or private models to meet latency, cost, or compliance needs. Bring your own embeddings and vector stack.",
    iconLabel: "Model Options",
    features: [
      {
        icon: <HiCloud key="hosted" />,
        label: "Hosted",
        tooltip: "Use hosted providers when appropriate",
      },
      {
        icon: <HiCodeBracket key="opensource" />,
        label: "Open source",
        tooltip: "Run open-source models in your infra",
      },
      {
        icon: <HiServer key="private" />,
        label: "Private",
        tooltip: "Support private/finetuned models",
      },
      {
        icon: <HiCpuChip key="edge" />,
        label: "On‑prem/Edge",
        tooltip: "Edge/on-prem inference where required",
      },
      {
        icon: <HiVariable key="embeddings" />,
        label: "BYO embeddings",
        tooltip: "Bring your own embedding stack",
      },
    ],
  },
];

