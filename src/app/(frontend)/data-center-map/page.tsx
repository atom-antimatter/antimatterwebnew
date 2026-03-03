import type { Metadata } from "next";
import DataCenterMapLoader from "./DataCenterMapLoader";

export const metadata: Metadata = {
  title: "Data Center & Fiber Map",
  description:
    "Explore data centers and fiber optic cable routes on an interactive 3D globe.",
};

export default function DataCenterMapPage() {
  return <DataCenterMapLoader />;
}
