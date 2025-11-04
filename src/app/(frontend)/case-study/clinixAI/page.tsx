import CaseStudy from "../component/CaseStudy";
import Reveal from "@/components/ui/Reveal";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clinix AI Case Study",
  description:
    "Clinix AI: Ambient clinical note generation, ICD/CPT automation, and EHR integration.",
};

const CaseStudyPage = () => {
  return (
    <CaseStudy
      title="Clinix AI"
      subtitle="The Future of Healthcare Documentation"
      heroImage="/images/CaseStudies/clinix/clinixai-1.jpg"
      summary="We co-founded and built Clinix AI as an “AI Operating System for healthcare.” The project focused on ambient clinical note generation, ICD/CPT code automation, and direct EHR integration. Our approach blended compliance (HIPAA, SOC2 readiness) with real-time AI workflows, scaling from pilot deployments to enterprise interest without venture capital."
      techStack={TechStack}
      projectLength="Ongoing since 2023 (MVP launched in < 12 months)."
      stats={<KeyStatsGrid />}
      testimonial={{
        title: "Clinix AI Testimonial",
        videoUrl:
          "https://www.youtube-nocookie.com/embed/5IKb62-dDxI?si=yfxRPy_64Sc-_vNL",
      }}
      gallery={[
        "/images/CaseStudies/clinix/clinix-5.jpg",
        "/images/CaseStudies/clinix/clinix-6.jpg",
        "/images/CaseStudies/clinix/clinix-7.jpg",
        "/images/CaseStudies/clinix/clinix-8.jpg",
      ]}
      pitchDeck={PitchDeck}
    />
  );
};

export default CaseStudyPage;

const KeyStatsGrid = () => {
  return (
    <div className="grid grid-cols-8 lg:grid-cols-12 grid-rows-8 gap-3 sm:gap-4 h-auto lg:h-[700px] xl:h-[800px] mt-10 sm:mt-30">
      <Reveal
        viewAmount={0}
        className="bg-gradient-to-r from-lightaccent to-primary col-span-4 row-span-2 sm:row-span-3 rounded-2xl p-0.5 sm:p-1 lg:hidden"
      >
        <div className="bg-background rounded-2xl size-full flex items-center justify-center py-8 p-5">
          <h3 className="text-2xl sm:text-4xl md:text-5xl xl:text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-lightaccent to-primary ">
            KEY STATS
          </h3>
        </div>
      </Reveal>
      <Reveal viewAmount={0} className="col-span-4 row-span-5">
        <Image
          src={"/images/CaseStudies/clinix/clinixai-2.jpg"}
          alt="Clinix AI interface view 1"
          width={440}
          height={444}
          className="w-full h-full object-cover rounded-2xl object-top-left"
        />
      </Reveal>
      <Reveal
        delay={0.1}
        viewAmount={0}
        className="col-span-4 row-span-3 sm:row-span-2 rounded-2xl bg-gradient-to-bl from-primary to-[#7072E4] px-5 sm:px-8 xl:px-10 flex items-center"
      >
        <h3 className="sm:text-lg md:text-xl xl:text-2xl font-semibold text-lightaccent">
          Projecting <br />
          <span className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl">
            1000+
          </span>
          <br /> providers by EOY 2025.
        </h3>
      </Reveal>
      <Reveal
        delay={0.2}
        viewAmount={0}
        className="col-span-4 row-span-5 lg:row-span-3 "
      >
        <Image
          src={"/images/CaseStudies/clinix/clinixai-4.jpg"}
          alt="Clinix AI interface view 2"
          width={440}
          height={260}
          className="w-full h-full object-cover rounded-2xl"
        />
      </Reveal>
      <Reveal
        delay={0.3}
        viewAmount={0}
        className="bg-gradient-to-r from-lightaccent to-primary col-span-4 row-span-3 rounded-2xl p-1 lg:block hidden"
      >
        <div className="bg-background rounded-2xl size-full flex items-center justify-center ">
          <h3 className="text-5xl xl:text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-lightaccent to-primary ">
            KEY STATS
          </h3>
        </div>
      </Reveal>
      <Reveal
        delay={0.4}
        viewAmount={0.4}
        className="bg-lightaccent col-span-4 row-span-5 rounded-2xl p-4 sm:p-8 2xl:p-12 flex flex-col "
      >
        <h3 className="text-background/85 font-bold text-5xl sm:text-7xl md:text-8xl xl:text-9xl">
          78%
        </h3>
        <h4 className="text-primary text-sm/[1rem] sm:text-xl md:text-[1.750rem] xl:text-4xl mt-5 sm:mt-10 md:mt-20 uppercase font-extrabold md:leading-8 xl:leading-none">
          reduction in <br /> documentation <br /> time per visit.
        </h4>
      </Reveal>
      <Reveal
        delay={0.4}
        viewAmount={0.2}
        className="bg-primary col-span-8 sm:col-span-5 row-span-3 rounded-2xl p-5 sm:p-8 md:p-10 2xl:p-20 flex flex-col justify-center text-lightaccent"
      >
        <h3 className="font-bold text-xl sm:text-2xl md:text-3xl xl:text-4xl">
          Early adoption <br /> across AthenaHealth
        </h3>
        <p className="mt-3 sm:mt-5 text-sm sm:text-base md:text-lg xl:text-xl">
          and underserved specialties like OB/GYN, Psych, and Physical Therapy.
        </p>
      </Reveal>
      <Reveal
        delay={0.5}
        viewAmount={0.2}
        className="col-span-8 sm:col-span-3 row-span-3 rounded-2xl"
      >
        <Image
          src={"/images/CaseStudies/clinix/clinixai-3.jpg"}
          alt="Clinix AI interface view 3"
          width={322}
          height={258}
          className="w-full h-full object-cover rounded-2xl"
        />
      </Reveal>
    </div>
  );
};

const PitchDeck = Array.from({ length: 13 }).map(
  (_, index) => `/images/CaseStudies/clinix/pitchdeck/${index + 1}.jpg`
);

const TechStack = [
  "Next.js",
  "React",
  "Tailwind",
  "Node.js",
  "Firestore",
  "Vertex AI",
  "LangChain",
  "HIPAA/SOC2-aligned Google Cloud deployment",
];
