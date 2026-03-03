"use client";

import dynamic from "next/dynamic";

const DataCenterMapClient = dynamic(
  () => import("./DataCenterMapClient").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen w-full bg-[#020202] flex items-center justify-center text-[#f6f6fd]/70">
        Loading globe…
      </div>
    ),
  }
);

export default function DataCenterMapLoader() {
  return <DataCenterMapClient />;
}
