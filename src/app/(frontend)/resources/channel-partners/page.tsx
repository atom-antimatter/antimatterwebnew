import { Metadata } from "next";
import ChannelPartnersClient from "./ChannelPartnersClient";

export const metadata: Metadata = {
  title: "Channel Partner Sales Assist | Antimatter AI",
  description:
    "Interactive AI-powered sales assistance for channel partners. Generate battlecards, proposals, pricing, and competitive positioning in minutes.",
  alternates: {
    canonical: "https://www.antimatterai.com/resources/channel-partners",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ChannelPartnersPage() {
  return <ChannelPartnersClient />;
}
