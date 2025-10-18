import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import Providers from "@/components/Providers";
import StartProjectModal from "@/components/ui/StartProjectModal";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Antimatter AI — Digital Solutions That Matter",
    template: "%s | Antimatter AI",
  },
  description:
    "Antimatter AI designs and builds high-impact AI products, secure platforms, and modern web experiences.",
  applicationName: "Antimatter AI",
  metadataBase: new URL("https://www.antimatterai.com"),
  openGraph: {
    title: "Antimatter AI — Digital Solutions That Matter",
    description:
    "We empower organizations with AI that turns complex challenges into real-world outcomes.",
    url: "https://www.antimatterai.com",
    siteName: "Antimatter AI",
    images: [
      {
        url: "/images/HeroOpenGraph.png",
        width: 1200,
        height: 630,
        alt: "Antimatter AI - Digital Solutions That Matter",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Antimatter AI — Digital Solutions That Matter",
    description:
      "We empower organizations with AI that turns complex challenges into real-world outcomes.",
    images: [
      { url: "/images/HeroOpenGraph.png", alt: "Antimatter AI - Digital Solutions That Matter" },
    ],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${geistSans.className} antialiased overflow-x-hidden`}>
        <NavBar />
        <div className="relative">
          <Providers>{children}</Providers>
        </div>
        <StartProjectModal />
        <Footer />
      </body>
    </html>
  );
}
