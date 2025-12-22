import { Suspense } from "react";
import VendorMatrixClient from "./VendorMatrixClient";

export default function VendorMatrixPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-background" />}>
      <VendorMatrixClient />
    </Suspense>
  );
}
