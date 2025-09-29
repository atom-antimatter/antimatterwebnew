import Reveal from "@/components/ui/Reveal";
import type { Metadata } from "next";
import CaseStudy from "../component/CaseStudy";

export const metadata: Metadata = {
  title: "Synergies4 Case Study",
  description: "Synergies4: Build skills that set you apart.",
};

const CaseStudyPage = () => {
  return (
    <CaseStudy
      title="Synergies4"
      subtitle="Build skills that set you apart."
      heroImage="/images/CaseStudies/synergies4.jpg"
      summary="Synergies4 came to us to build a scalable course platform plus AI-powered career accelerators. We developed a Next.js app with integrated learning modules, resume tailoring AI, and job-readiness tools. Our approach fused edtech usability with AI augmentation, positioning Synergies4 as more than a course platform—an end-to-end professional growth suite."
      techStack={TechStack}
      projectLength="Under 4 months to initial launch."
      stats={<KeyStatsGrid />}
    />
  );
};

export default CaseStudyPage;

const KeyStatsGrid = () => {
  return (
    <div className="mt-10 sm:mt-30">
      <Reveal>
        <h2 className="text-6xl font-light text-center mb-20 uppercase">
          Key stats
        </h2>
      </Reveal>
      <Reveal className="flex">
        <div className="w-[500px] max-w-full py-8 px-10 border-l-4 border-accent bg-foreground/5">
          Online courses offered across PMP, Agile, Scrum, and related
          frameworks.
        </div>
      </Reveal>
      <Reveal className="flex justify-center">
        <div className="w-[500px] max-w-full py-8 px-10 border-l-4 border-accent bg-foreground/5">
          Early traction in professional training market with subscription
          revenue model.
        </div>
      </Reveal>
      <Reveal className="flex justify-end">
        <div className="w-[500px] max-w-full py-8 px-10 border-l-4 border-accent bg-foreground/5">
          Embedded AI tools boosted course completion and student engagement.
        </div>
      </Reveal>
    </div>
  );
};

const TechStack = [
  "Next.js",
  "React",
  "Tailwind",
  "Supabase",
  "Custom AI integrations (resume customizer, career tools)",
  "Stripe for payments.",
];
