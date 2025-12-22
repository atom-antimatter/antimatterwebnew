"use client";

import dynamic from "next/dynamic";

const VendorMatrixClient = dynamic(
  () => import("./VendorMatrixClient"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-foreground/60">Loading Vendor Matrix...</div>
      </div>
    ),
  }
);

export default function ClientWrapper() {
  return <VendorMatrixClient />;
}

