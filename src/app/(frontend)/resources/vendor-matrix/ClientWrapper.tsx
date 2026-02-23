"use client";

import { Suspense } from "react";
import VendorMatrixClient from "./VendorMatrixClient";

export default function ClientWrapper() {
  return (
    <Suspense fallback={null}>
      <VendorMatrixClient />
    </Suspense>
  );
}

