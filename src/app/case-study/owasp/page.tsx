import Reveal from "@/components/ui/Reveal";
import type { Metadata } from "next";
import CaseStudy from "../component/CaseStudy";

export const metadata: Metadata = {
  title: "OWASP Case Study",
  description: "OWASP: Explore the world of cyber security.",
};

const CaseStudyPage = () => {
  return (
    <CaseStudy
      title="OWASP"
      subtitle="Explore the world of cyber security."
      heroImage="/images/CaseStudies/owasp.jpg"
      summary="We partnered with OWASP to execute a full redesign of their global web presence. Beyond technical upgrades, we focused on community engagement: improved UX, consistent responsive design across devices, simplified navigation, and high-visibility CTAs for membership and donations. Our approach combined modern frontend performance with nonprofit-centric conversion design, ensuring OWASP's digital hub supports both its mission and sustainability."
      techStack={TechStack}
      projectLength="Multi-phase (2024-2025)."
      stats={<KeyStatsGrid />}
      gallery={[
        "/images/CaseStudies/owasp/owasp_1.jpg",
        "/images/CaseStudies/owasp/owasp_2.jpg",
        "/images/CaseStudies/owasp/owasp_3.jpg",
        "/images/CaseStudies/owasp/owasp_4.jpg",
      ]}
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
      <div className="grid  sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <div className="py-8 px-10 border-l-4 border-accent bg-foreground/5">
          Full redesign of OWASP.org and subdomains.
        </div>
        <div className="py-8 px-10 border-l-4 border-accent bg-foreground/5">
          Dramatic improvements to responsiveness and mobile UX.
        </div>
        <div className="py-8 px-10 border-l-4 border-accent bg-foreground/5">
          Streamlined navigation for 100k+ global community members.
        </div>
        <div className="py-8 px-10 border-l-4 border-accent bg-foreground/5">
          Lighthouse Scores 99+ on all platforms.
        </div>
        <div className="py-8 px-10 border-l-4 border-accent bg-foreground/5">
          Added clear CTAs for membership and onsite donations.
        </div>
        <div className="py-8 px-10 border-l-4 border-accent bg-foreground/5">
          Over 2.5M unique visitors per month.
        </div>
      </div>
    </div>
  );
};

const TechStack = [
  "Next.js",
  "MDX",
  "Cloudflare",
  "Supabase",
  "Custom CMS integration.",
];
