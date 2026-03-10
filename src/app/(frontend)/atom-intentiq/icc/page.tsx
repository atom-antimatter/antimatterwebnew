import { Metadata } from "next";
import ICCIntentClient from "./ICCIntentClient";

export const metadata: Metadata = {
  title: "Atom IntentIQ for ICC — Proposal Intelligence & Code Search",
  description:
    "A citation-backed AI workspace for proposal guidance, code search, and structured research across ICC codebooks and lifecycle documents.",
  robots: { index: false, follow: false },
};

export default function ICCIntentPage() {
  return <ICCIntentClient />;
}
