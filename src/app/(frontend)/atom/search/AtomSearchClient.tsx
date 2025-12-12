"use client";

import dynamic from "next/dynamic";

const AtomSearchApp = dynamic(
  () => import("@/app/pages/App/App").then((m) => m.App),
  { ssr: false },
);

export default function AtomSearchClient() {
  return <AtomSearchApp />;
}
