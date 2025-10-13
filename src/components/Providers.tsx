import ReactLenis from "lenis/react";
import { ScrollRestoration } from "@/utils/scrollRestoration";
import PageTransition from "./ui/PageTransition";
import { LenisIntegration } from "./LenisIntegration";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Lenis for smooth scrolling */}
      <ReactLenis root options={{ duration: 1.5 }}>
        <main>{children}</main>
        <LenisIntegration />
      </ReactLenis>
      <PageTransition />

      {/* Custom scroll restoration */}
      <ScrollRestoration />
    </>
  );
}
