import type { Metadata } from "next";
import DataCenterMapLoader from "./DataCenterMapLoader";

export const metadata: Metadata = {
  title: "Infrastructure Atlas — Data Center & Fiber Map",
  description:
    "Explore global data centers and fiber routes on an interactive 3D globe. Search by location, zip code, capability, and more.",
};

export default function DataCenterMapPage() {
  return <DataCenterMapLoader />;
}
