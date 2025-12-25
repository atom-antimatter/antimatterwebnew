import ClientsSection from "@/components/ClientsSection";
import CTASection from "@/components/CTASection";
import AtomAIHeroSection from "@/components/AtomAIHeroSection";
import AtomValuePropsSection from "@/components/AtomValuePropsSection";
import EnterpriseCompareStrip from "@/components/EnterpriseCompareStrip";
import EnterpriseAIPillarsSection from "@/components/EnterpriseAIPillarsSection";
import EdgeDeploymentSection from "@/components/EdgeDeploymentSection";
import AtomAIFrameworkDetails from "@/components/AtomAIFrameworkDetails";
import LightRays from "@/components/ui/LightRays";
import Loading from "@/components/ui/Loading";
import MainLayout from "@/components/ui/MainLayout";
import TransitionContainer from "@/components/ui/TransitionContainer";
import Interactions from "@/utils/interactions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enterprise AI Deployment Framework (Atom)",
  description:
    "Deploy agentic AI in VPC, hybrid, on-prem, or edge—secure by default, model-agnostic, with IP ownership and audit-ready controls.",
  alternates: {
    canonical: "https://www.antimatterai.com/enterprise-ai",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Enterprise AI Deployment Framework (Atom)",
    description:
      "Deploy agentic AI in VPC, hybrid, on-prem, or edge—secure by default, model-agnostic, with IP ownership and audit-ready controls.",
    url: "https://www.antimatterai.com/enterprise-ai",
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
    title: "Enterprise AI Deployment Framework (Atom)",
    description:
      "Deploy agentic AI in VPC, hybrid, on-prem, or edge—secure by default, model-agnostic, with IP ownership and audit-ready controls.",
    images: [{ url: "/images/HeroOpenGraph.png" }],
  },
};

export default function EnterpriseAIPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.antimatterai.com/#organization",
        name: "Antimatter AI",
        url: "https://www.antimatterai.com",
        logo: {
          "@type": "ImageObject",
          url: "https://www.antimatterai.com/icon.svg",
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://www.antimatterai.com/enterprise-ai#webpage",
        url: "https://www.antimatterai.com/enterprise-ai",
        name: "Enterprise AI Deployment Framework (Atom) | Antimatter AI",
        description:
          "Deploy agentic AI in VPC, hybrid, on-prem, or edge—secure by default, model-agnostic, with IP ownership and audit-ready controls.",
        isPartOf: { "@id": "https://www.antimatterai.com/#website" },
        about: { "@id": "https://www.antimatterai.com/#organization" },
      },
      {
        "@type": "WebSite",
        "@id": "https://www.antimatterai.com/#website",
        url: "https://www.antimatterai.com",
        name: "Antimatter AI",
        publisher: { "@id": "https://www.antimatterai.com/#organization" },
      },
    ],
  } as const;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LightRays />
      <TransitionContainer initial={100} exit={-600}>
        <AtomAIHeroSection />
        <AtomValuePropsSection />
        <MainLayout className="pt-40 sm:pt-60 overflow-x-hidden">
          <EnterpriseCompareStrip />
          <EnterpriseAIPillarsSection />
          <EdgeDeploymentSection />
          <AtomAIFrameworkDetails />
          <ClientsSection />
          <CTASection />
        </MainLayout>
        <Interactions />
      </TransitionContainer>
      <Loading />
    </>
  );
}

