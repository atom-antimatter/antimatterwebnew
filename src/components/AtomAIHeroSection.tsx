import ParticelsStatic from "./ParticelsStatic";
import AtomAIHeroComponent from "./AtomAIHeroComponent";

const AtomAIHeroSection = () => {
  return (
    <div className="relative w-full min-h-fit md:h-screen z-40 overflow-x-hidden" id="hero-section">
      <h2
        id="hero-company"
        className="absolute top-24 sm:top-30 left-1/2 -translate-x-1/2 text-[18vw] sm:text-[14vw] font-bold text-nowrap text-center opacity-[0.025] sm:opacity-5 pointer-events-none select-none"
      >
        ATOM AI
      </h2>
      {/* Desktop/tablet: keep the orb as an absolute background layer */}
      <div className="hidden md:block">
        <ParticelsStatic className="size-[520px] lg:size-[700px] 2xl:size-[900px]" />
      </div>
      <div className="relative z-20 min-h-fit md:h-full">
        <AtomAIHeroComponent />
      </div>
    </div>
  );
};

export default AtomAIHeroSection;

