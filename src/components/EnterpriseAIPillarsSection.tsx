import Reveal from "./ui/Reveal";
import EnterpriseAIPillarCardContainer from "./ui/EnterpriseAIPillarCardContainer";
import BreakTitle from "./ui/BreakTitle";
import CompareEnterpriseAICTA from "./ui/CompareEnterpriseAICTA";

const EnterpriseAIPillarsSection = () => {
  return (
    <div id="enterprise-pillars-section">
      <div className="w-full" id="enterprise-pillars">
        <div className="w-full flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row gap-10 sm:gap-30 xl:gap-43 justify-between">
            <div className="whitespace-nowrap">
              <BreakTitle
                text="Enterprise AI Deployment"
                className="text-3xl xl:text-title/tight"
              />
            </div>
            <Reveal className="font-light max-w-[390px] justify-end">
              <p>
                Built for regulated teams that need isolation, auditability, and deployment control. Keep your data and IP in your environment—without provider lock‑in.
              </p>
            </Reveal>
          </div>
          <Reveal className="relative overflow-visible">
            <div className="hidden lg:block absolute -right-[100px] lg:-right-[300px] wide:hidden top-0 h-full w-[150px] sm:w-[300px] bg-gradient-to-l from-background from-75% to-white/0 z-10"></div>
            <EnterpriseAIPillarCardContainer />
          </Reveal>

          {/* Compare strip (between sections) */}
          <Reveal y={40} className="mt-10">
            <div className="w-full rounded-2xl border border-foreground/15 bg-background/20 backdrop-blur px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-foreground/75">
                Want the full breakdown?
              </p>
              <CompareEnterpriseAICTA location="cards" variant="secondary" />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseAIPillarsSection;

