import ReactLenis from "lenis/react";
import { ScrollRestoration } from "@/utils/scrollRestoration";
import PageTransition from "./ui/PageTransition";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Lenis for smooth scrolling - faster duration */}
      <ReactLenis root options={{ duration: 0.8 }}>
        <main>{children}</main>
      </ReactLenis>
      <PageTransition />

      {/* Custom scroll restoration */}
      <ScrollRestoration />
    </>
  );
}
