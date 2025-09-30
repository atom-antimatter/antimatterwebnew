import Reveal from "@/components/ui/Reveal";
import type { Metadata } from "next";
import CaseStudy from "../component/CaseStudy";

export const metadata: Metadata = {
  title: "Feature Case Study",
  description:
    "Feature: The social marketplace connecting fans Directly with entertainers through authentic interactions",
};

const CaseStudyPage = () => {
  return (
    <CaseStudy
      title="Feature"
      subtitle="The social marketplace connecting fans Directly with entertainers through authentic interactions"
      heroImage="/images/CaseStudies/feature_1.jpg"
      summary="Feature engaged Antimatter to create a next-gen streaming marketplace. We led the UI/UX from the ground up—designing interactive flows for concerts, PPV events, and personalized video sessions. On the engineering side, we built fully native apps in Swift and Kotlin, deployed on GCP, and integrated Agora's SDK for high-quality live and interactive video. The result is a polished digital venue where creators monetize performances and fans enjoy seamless, mobile-first experiences."
      techStack={TechStack}
      projectLength="9 months (concept to launch)"
      stats={<KeyStatsGrid />}
      pitchDeck={PitchDeck}
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
      <div className="grid  sm:grid-cols-2 gap-2">
        <div className="py-8 px-10 border-l-4 border-accent bg-foreground/5">
          Built for creators to sell PPV livestreams and concerts.
        </div>
        <div className="py-8 px-10 border-l-4 border-accent bg-foreground/5">
          Integrated 1:1 video chat with calendar booking.
        </div>
        <div className="py-8 px-10 border-l-4 border-accent bg-foreground/5">
          Optimized streaming experiences powered by Agora’s low-latency video
          APIs.
        </div>
        <div className="py-8 px-10 border-l-4 border-accent bg-foreground/5">
          Custom marketplace UX for browsing, purchasing, and attending events.
        </div>
      </div>
    </div>
  );
};

const TechStack = [
  "Native iOS (Swift)",
  "Native Android (Kotlin)",
  "Google Cloud Platform (GCP)",
  "Agora streaming SDK",
];

const PitchDeck = Array.from({ length: 21 }).map(
  (_, index) => `/images/CaseStudies/feature/pitchdeck/${index + 1}.jpg`
);
