"use client";

import { Suspense } from "react";
import VendorMatrixClient from "./VendorMatrixClient";

export default function ClientWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-background flex items-center justify-center">
          <div className="text-foreground/60">Loading Vendor Matrix...</div>
        </div>
      }
    >
      <VendorMatrixClient />
    </Suspense>
  );
}

