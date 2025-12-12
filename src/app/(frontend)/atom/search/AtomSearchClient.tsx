"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

const AtomSearchApp = dynamic(
  () => import("@/app/pages/App/App").then((m) => m.App),
  { ssr: false },
);

export default function AtomSearchClient() {
  useEffect(() => {
    const prev = document.body.getAttribute("data-theme");
    document.body.setAttribute("data-theme", "dark");
    return () => {
      if (prev) document.body.setAttribute("data-theme", prev);
      else document.body.removeAttribute("data-theme");
    };
  }, []);
  return <AtomSearchApp />;
}
