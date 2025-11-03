import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import Providers from "@/components/Providers";
import StartProjectModal from "@/components/ui/StartProjectModal";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import LayoutContent from "./LayoutContent";

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
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6FPMJ6P9VB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6FPMJ6P9VB');
          `}
        </Script>
        {/* OTTO Pixel Script - exact format required by SearchAtlas */}
        <Script
          id="sa-dynamic-optimization"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) return;
                if (document.getElementById('sa-dynamic-optimization')) return;
                var script = document.createElement('script');
                script.setAttribute('nowprocket', '');
                script.setAttribute('nitro-exclude', '');
                script.type = 'text/javascript';
                script.id = 'sa-dynamic-optimization';
                script.setAttribute('data-uuid', 'e3f40bc6-a9b5-40a1-b221-3bb88c2ef83a');
                script.src = 'data:text/javascript;base64,dmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoInNjcmlwdCIpO3NjcmlwdC5zZXRBdHRyaWJ1dGUoIm5vd3Byb2NrZXQiLCAiIik7c2NyaXB0LnNldEF0dHJpYnV0ZSgibml0cm8tZXhjbHVkZSIsICIiKTtzY3JpcHQuc3JjID0gImh0dHBzOi8vZGFzaGJvYXJkLnNlYXJjaGF0bGFzLmNvbS9zY3JpcHRzL2R5bmFtaWNfb3B0aW1pemF0aW9uLmpzIjtzY3JpcHQuZGF0YXNldC51dWlkID0gImUzZjQwYmM2LWE5YjUtNDBhMS1iMjIxLTNiYjg4YzJlZjgzYSI7c2NyaXB0LmlkID0gInNhLWR5bmFtaWMtb3B0aW1pemF0aW9uLWxvYWRlciI7ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpOw==';
                if (document.head) {
                  document.head.appendChild(script);
                } else {
                  var observer = new MutationObserver(function() {
                    if (document.head && !document.getElementById('sa-dynamic-optimization')) {
                      document.head.appendChild(script);
                      observer.disconnect();
                    }
                  });
                  observer.observe(document.documentElement, { childList: true });
                }
              })();
            `,
          }}
        />
        <LayoutContent>
          <NavBar />
          <Providers>{children}</Providers>
          <StartProjectModal />
          <Footer />
        </LayoutContent>
      </body>
    </html>
  );
}
