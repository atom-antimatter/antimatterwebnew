import { HiShieldCheck, HiLockClosed, HiKey, HiDocumentCheck, HiNoSymbol } from "react-icons/hi2";
import { HiCube, HiTemplate, HiDownload, HiDatabase, HiUserGroup } from "react-icons/hi2";
import { HiCog, HiLightningBolt, HiLink, HiBookOpen, HiSparkles } from "react-icons/hi2";
import { HiServer, HiCode, HiCpuChip, HiCloud, HiVariable } from "react-icons/hi2";

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
    title: "Enterprise-Grade Security & Compliance",
    description:
      "Atom is built for regulated environments from day one—supporting private cloud, hybrid, and on-prem deployments with strict data isolation, encryption, and auditability.",
    iconLabel: "Enterprise Controls",
    features: [
      {
        icon: <HiLockClosed key="encryption" />,
        label: "Encryption",
        tooltip: "Encryption in transit and at rest",
      },
      {
        icon: <HiShieldCheck key="networking" />,
        label: "Private networking",
        tooltip: "VPC / private network isolation supported",
      },
      {
        icon: <HiKey key="sso" />,
        label: "SSO/RBAC",
        tooltip: "SSO + role-based access controls",
      },
      {
        icon: <HiDocumentCheck key="audit" />,
        label: "Audit logs",
        tooltip: "Auditable access and activity trails",
      },
      {
        icon: <HiNoSymbol key="training" />,
        label: "No training",
        tooltip: "Customer data is never used for training",
      },
    ],
  },
  {
    number: "02",
    title: "You Own the IP. Full Stop.",
    description:
      "All prompts, agents, workflows, and outputs belong entirely to you. Atom never claims ownership, never resells metadata, and never trains on your data.",
    iconLabel: "Ownership Guarantees",
    features: [
      {
        icon: <HiCube key="ip" />,
        label: "IP ownership",
        tooltip: "100% customer-owned IP",
      },
      {
        icon: <HiUserGroup key="tenant" />,
        label: "Tenant boundaries",
        tooltip: "Hard isolation between tenants/environments",
      },
      {
        icon: <HiDownload key="export" />,
        label: "Exportable logic",
        tooltip: "Export workflows, prompts, and agent configs",
      },
      {
        icon: <HiDatabase key="retention" />,
        label: "Data retention control",
        tooltip: "Configurable retention & deletion",
      },
      {
        icon: <HiTemplate key="pools" />,
        label: "No shared prompt pools",
        tooltip: "No shared prompt pools or cross-tenant learning",
      },
    ],
  },
  {
    number: "03",
    title: "Atom Is a Framework, Not a Tool",
    description:
      "Atom is an extensible AI framework for building and operating agentic systems—modular, composable, and designed to evolve with your org.",
    iconLabel: "Framework Components",
    features: [
      {
        icon: <HiCog key="agents" />,
        label: "Agents",
        tooltip: "Composable agents for different jobs",
      },
      {
        icon: <HiLightningBolt key="orchestration" />,
        label: "Orchestration",
        tooltip: "Deterministic orchestration layer",
      },
      {
        icon: <HiLink key="tools" />,
        label: "Tool calling",
        tooltip: "Secure tool execution with policy",
      },
      {
        icon: <HiBookOpen key="rag" />,
        label: "RAG",
        tooltip: "Grounded retrieval over your sources",
      },
      {
        icon: <HiSparkles key="genui" />,
        label: "GenUI",
        tooltip: "Dynamic UI generated from structured outputs",
      },
    ],
  },
  {
    number: "04",
    title: "Model-Agnostic by Design",
    description:
      "Bring your own models—commercial, open-source, or private—and swap providers without rewriting your system.",
    iconLabel: "Supported Model Types",
    features: [
      {
        icon: <HiCloud key="hosted" />,
        label: "Hosted LLMs",
        tooltip: "Use hosted providers when appropriate",
      },
      {
        icon: <HiCode key="opensource" />,
        label: "Open-source",
        tooltip: "Run open-source models in your infra",
      },
      {
        icon: <HiServer key="private" />,
        label: "Private models",
        tooltip: "Support private/finetuned models",
      },
      {
        icon: <HiCpuChip key="edge" />,
        label: "Edge inference",
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

