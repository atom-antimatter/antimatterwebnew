import Particels from "./Particels";
import AtomAIHeroComponent from "./AtomAIHeroComponent";

const AtomAIHeroSection = () => {
  return (
    <div className="relative w-full h-screen z-40 overflow-x-hidden" id="hero-section">
      <h2
        id="hero-company"
        className="absolute top-30 left-1/2 -translate-x-1/2 text-[14vw] font-bold text-nowrap text-center opacity-5"
      >
        ATOM AI
      </h2>
      <Particels />
      <div className="relative z-20 h-full">
        <AtomAIHeroComponent />
      </div>
    </div>
  );
};

export default AtomAIHeroSection;

