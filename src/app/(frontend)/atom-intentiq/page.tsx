import { Metadata } from "next";
import AtomIntentIQClient from "./AtomIntentIQClient";

export const metadata: Metadata = {
  title: "Atom IntentIQ | Buyer Intent AI for Enterprise Pipeline",
  description:
    "Real-time buyer intent scoring, lead qualification, and AI-generated follow-ups powered by Atom IntentIQ.",
  alternates: {
    canonical: "https://www.antimatterai.com/atom-intentiq",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Atom IntentIQ | Buyer Intent AI for Enterprise Pipeline",
    description:
      "Real-time buyer intent scoring, lead qualification, and AI-generated follow-ups powered by Atom IntentIQ.",
    url: "https://www.antimatterai.com/atom-intentiq",
    siteName: "Antimatter AI",
    type: "website",
    images: [
      {
        url: "/images/HeroOpenGraph.png",
        width: 1200,
        height: 630,
        alt: "Antimatter AI — Digital Solutions That Matter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atom IntentIQ | Buyer Intent AI for Enterprise Pipeline",
    description:
      "Real-time buyer intent scoring, lead qualification, and AI-generated follow-ups powered by Atom IntentIQ.",
    images: [{ url: "/images/HeroOpenGraph.png" }],
  },
};

export default function AtomIntentIQPage() {
  return <AtomIntentIQClient />;
}
