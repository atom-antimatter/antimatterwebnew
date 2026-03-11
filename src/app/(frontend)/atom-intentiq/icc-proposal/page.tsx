import { Metadata } from "next";
import ICCProposalClient from "./ICCProposalClient";

export const metadata: Metadata = {
  title: "ICC AI Assistant — Custom RAG Search & Insights | Antimatter AI",
  description:
    "A custom, citation-backed AI assistant embedded within ICC's existing digital experience to improve code discovery, support proposal research, and surface user behavior insights.",
  robots: { index: false, follow: false },
};

export default function ICCProposalPage() {
  return <ICCProposalClient />;
}
