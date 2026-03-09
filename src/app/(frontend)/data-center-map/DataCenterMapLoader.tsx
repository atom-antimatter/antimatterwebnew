"use client";

import dynamic from "next/dynamic";

const DataCenterMapClient = dynamic(
  () => import("./DataCenterMapClient").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[100dvh] w-full bg-[#020202]" />
    ),
  }
);

export default function DataCenterMapLoader() {
  return <DataCenterMapClient />;
}
