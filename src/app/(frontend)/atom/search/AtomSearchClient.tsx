"use client";

import dynamic from "next/dynamic";

const AtomSearchApp = dynamic(
  () => import("@/app/pages/App/App").then((m) => m.App),
  {
    // Critical: prevents Prism (and other browser-only deps) from executing on the server.
    ssr: false,
    loading: () => (
      <div className="min-h-screen w-screen relative">
        <div className="fixed inset-0 z-0 atom-search-bg" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-secondary text-sm">Loading Atom Search…</div>
        </div>
      </div>
    ),
  },
);

export default function AtomSearchClient() {
  return <AtomSearchApp />;
}
