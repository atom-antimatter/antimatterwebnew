import MainLayout from "@/components/ui/MainLayout";
import WorkComponent from "./WorkComponent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected case studies and recent projects by Antimatter AI.",
};

const WorkData = [
  {
    title: "Clinix AI",
    image: "/images/CaseStudies/clinix/clinixai.jpg",
    tags: ["Web Design", "App Design", "AI Development", "GTM"],
    id: 1,
    link: "/case-study/clinixAI",
  },
  {
    title: "Synergies4",
    image: "/images/CaseStudies/synergies4.jpg",
    tags: ["App Design", "AI Development"],
    id: 2,
    link: "/case-study/synergies4",
  },
  {
    title: "Curehire",
    image: "/images/CaseStudies/curehire.jpg",
    tags: ["Web Design", "Development"],
    id: 3,
    link: "/case-study/curehire",
  },
  {
    title: "OWASP",
    image: "/images/CaseStudies/owasp.jpg",
    tags: ["Web Design", "Development"],
    id: 4,
    link: "/case-study/owasp",
  },
  {
    title: "Feature",
    image: "/images/CaseStudies/feature.jpg",
    tags: ["App Design", "GTM"],
    id: 5,
    link: "/case-study/feature",
  },
];

const WorkPage = () => {
  return (
    <MainLayout className="pt-28 md:pt-40">
      <WorkComponent WorkData={WorkData} />
    </MainLayout>
  );
};

export default WorkPage;
