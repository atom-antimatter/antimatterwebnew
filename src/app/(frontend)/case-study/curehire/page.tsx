import Reveal from "@/components/ui/Reveal";
import type { Metadata } from "next";
import CaseStudy from "../component/CaseStudy";

export const metadata: Metadata = {
  title: "Curehire Case Study",
  description: "Curehire: Using AI with a human touch.",
};

const CaseStudyPage = () => {
  return (
    <CaseStudy
      title="Curehire"
      subtitle="Using AI with a human touch."
      heroImage="/images/CaseStudies/curehire-1.jpg"
      summary="Curehire needed their Framer site rebuilt in Wix to prioritize performance, SEO, and responsiveness. We delivered a fast, mobile-optimized site with additional SEO landing pages and a structured blog system, positioning them for long-term organic growth while retaining their brand aesthetic."
      techStack={TechStack}
      projectLength="10 business days."
      stats={<KeyStatsGrid />}
      gallery={[
        "/images/CaseStudies/curehire/curehire_1.jpg",
        "/images/CaseStudies/curehire/curehire_2.jpg",
        "/images/CaseStudies/curehire/curehire_3.jpg",
        "/images/CaseStudies/curehire/curehire_4.jpg",
      ]}
    />
  );
};

export default CaseStudyPage;

const KeyStatsGrid = () => {
  return (
    <div className="mt-10 sm:mt-30">
      <Reveal>
        <h2 className="text-4xl sm:text-6xl font-light text-center mb-20 uppercase">
          Key stats
        </h2>
      </Reveal>
      <div className="flex flex-col gap-1">
        <Reveal className="flex">
          <div className="w-[500px] max-w-full py-8 px-10 border-l-4 border-accent bg-foreground/5">
            Migration cut load times significantly (under 2s on mobile).
          </div>
        </Reveal>
        <Reveal className="flex justify-center">
          <div className="w-[500px] max-w-full py-8 px-10 border-l-4 border-accent bg-foreground/5">
            Added 7+ optimized SEO pages and a blog for long-tail specialty
            keywords.
          </div>
        </Reveal>
        <Reveal className="flex justify-end">
          <div className="w-[500px] max-w-full py-8 px-10 border-l-4 border-accent bg-foreground/5">
            Improved responsiveness across devices (mobile-first design).
          </div>
        </Reveal>
      </div>
    </div>
  );
};

const TechStack = [
  "Wix (migrated from Framer)",
  "Custom SEO configuration",
  "Blog CMS.",
];
