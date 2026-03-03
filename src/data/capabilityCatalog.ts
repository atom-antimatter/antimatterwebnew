export type CapabilityMeta = {
  id: string;
  label: string;
  shortLabel: string;
  /** Lucide icon name (import manually when rendering). */
  iconName: string;
  description: string;
  /** Tailwind-compatible hex for chip color. */
  color: string;
};

/**
 * Master catalog of all capability tags.
 * Keys match the strings stored in DataCenter.capabilities[].
 */
export const CAPABILITY_CATALOG: Record<string, CapabilityMeta> = {
  "colocation": {
    id: "colocation",
    label: "Colocation",
    shortLabel: "Colo",
    iconName: "Building2",
    description: "Shared physical facility for customer-owned servers and networking hardware.",
    color: "#696aac",
  },
  "cloud": {
    id: "cloud",
    label: "Cloud Connect",
    shortLabel: "Cloud",
    iconName: "Cloud",
    description: "Direct or virtual connections to major cloud providers (AWS, Azure, GCP).",
    color: "#8587e3",
  },
  "edge": {
    id: "edge",
    label: "Edge Computing",
    shortLabel: "Edge",
    iconName: "Zap",
    description: "Low-latency compute resources positioned close to end users or IoT devices.",
    color: "#a2a3e9",
  },
  "gpu": {
    id: "gpu",
    label: "GPU / AI Compute",
    shortLabel: "GPU",
    iconName: "Cpu",
    description: "High-density GPU clusters for AI training, inference, and rendering workloads.",
    color: "#c7c8f2",
  },
  "hpc": {
    id: "hpc",
    label: "HPC",
    shortLabel: "HPC",
    iconName: "Server",
    description: "High-Performance Computing resources for scientific simulation and modeling.",
    color: "#a2a3e9",
  },
  "interconnect": {
    id: "interconnect",
    label: "Interconnect / IX",
    shortLabel: "IX",
    iconName: "Network",
    description: "Internet Exchange Point access or private interconnection cross-connects.",
    color: "#696aac",
  },
  "carrier-neutral": {
    id: "carrier-neutral",
    label: "Carrier Neutral",
    shortLabel: "Carrier+",
    iconName: "Radio",
    description: "Supports multiple carriers and ISPs within the same facility.",
    color: "#8587e3",
  },
  "hyperscale": {
    id: "hyperscale",
    label: "Hyperscale",
    shortLabel: "Hyperscale",
    iconName: "Globe",
    description: "Designed to scale rapidly with very large compute and storage deployments.",
    color: "#696aac",
  },
  "bare-metal": {
    id: "bare-metal",
    label: "Bare Metal",
    shortLabel: "Bare Metal",
    iconName: "HardDrive",
    description: "Dedicated physical servers without hypervisor virtualization overhead.",
    color: "#c7c8f2",
  },
  "direct-connect": {
    id: "direct-connect",
    label: "Direct Connect",
    shortLabel: "Direct",
    iconName: "Cable",
    description: "Private network connections bypassing the public internet.",
    color: "#a2a3e9",
  },
  "compliance:soc2": {
    id: "compliance:soc2",
    label: "SOC 2",
    shortLabel: "SOC 2",
    iconName: "ShieldCheck",
    description: "AICPA SOC 2 Type II audited for security, availability, and confidentiality.",
    color: "#8587e3",
  },
  "compliance:hipaa": {
    id: "compliance:hipaa",
    label: "HIPAA",
    shortLabel: "HIPAA",
    iconName: "Shield",
    description: "Meets HIPAA security and privacy requirements for healthcare data.",
    color: "#c7c8f2",
  },
  "sovereign": {
    id: "sovereign",
    label: "Sovereign Cloud",
    shortLabel: "Sovereign",
    iconName: "Landmark",
    description: "Data residency and operational controls meeting national sovereignty requirements.",
    color: "#696aac",
  },
  "mpls": {
    id: "mpls",
    label: "MPLS",
    shortLabel: "MPLS",
    iconName: "GitMerge",
    description: "Multi-Protocol Label Switching for private WAN connectivity.",
    color: "#a2a3e9",
  },
};

/** All capability IDs used for search parsing. */
export const ALL_CAPABILITY_IDS = Object.keys(CAPABILITY_CATALOG);

/** Top capabilities to show in filter pills (most common). */
export const FEATURED_CAPABILITIES = [
  "colocation",
  "cloud",
  "edge",
  "gpu",
  "interconnect",
  "carrier-neutral",
  "hyperscale",
  "bare-metal",
  "compliance:soc2",
  "sovereign",
] as const;

export type FeaturedCapability = (typeof FEATURED_CAPABILITIES)[number];

/** Resolve a capability ID to its label (falls back to id). */
export function capabilityLabel(id: string): string {
  return CAPABILITY_CATALOG[id]?.label ?? id;
}

/** Resolve a capability ID to its short label (falls back to id). */
export function capabilityShortLabel(id: string): string {
  return CAPABILITY_CATALOG[id]?.shortLabel ?? id;
}
