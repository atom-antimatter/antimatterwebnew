import ClientWrapper from "./ClientWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Vendor Matrix: Compare Enterprise AI Platforms",
  description:
    "Compare enterprise AI platforms across deployment models, security, IP ownership, and integrations. Use the AI Vendor Matrix to evaluate the best fit.",
  alternates: {
    canonical: "https://www.antimatterai.com/resources/vendor-matrix",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AI Vendor Matrix: Compare Enterprise AI Platforms",
    description:
      "Compare enterprise AI platforms across deployment models, security, IP ownership, and integrations. Use the AI Vendor Matrix to evaluate the best fit.",
    url: "https://www.antimatterai.com/resources/vendor-matrix",
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
    title: "AI Vendor Matrix: Compare Enterprise AI Platforms",
    description:
      "Compare enterprise AI platforms across deployment models, security, IP ownership, and integrations. Use the AI Vendor Matrix to evaluate the best fit.",
    images: [{ url: "/images/HeroOpenGraph.png" }],
  },
};

export default function VendorMatrixPage() {
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
        "@id": "https://www.antimatterai.com/resources/vendor-matrix#webpage",
        url: "https://www.antimatterai.com/resources/vendor-matrix",
        name: "AI Vendor Matrix: Compare Enterprise AI Platforms | Antimatter AI",
        description:
          "Compare enterprise AI platforms across deployment models, security, IP ownership, and integrations. Use the AI Vendor Matrix to evaluate the best fit.",
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
      <ClientWrapper />
    </>
  );
}
