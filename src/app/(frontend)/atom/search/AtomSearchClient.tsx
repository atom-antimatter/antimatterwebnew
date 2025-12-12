"use client";

import { App } from "@/app/pages/App/App";

export default function AtomSearchClient() {
  // Render the app directly (avoids a separate next/dynamic chunk that can fail on first load).
  return <App />;
}
