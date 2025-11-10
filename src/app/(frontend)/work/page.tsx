import MainLayout from "@/components/ui/MainLayout";
import { WorkData } from "@/data/workData";
import type { Metadata } from "next";
import WorkComponent from "./WorkComponent";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected case studies and recent projects by Antimatter AI.",
};

const WorkPage = () => {
  return (
    <MainLayout className="pt-28 md:pt-40">
      <WorkComponent WorkData={WorkData} />
    </MainLayout>
  );
};

export default WorkPage;
