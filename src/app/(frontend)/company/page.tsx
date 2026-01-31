import { MotionDiv } from "@/components/Motion";
import Button from "@/components/ui/Button";
import MainLayout from "@/components/ui/MainLayout";
import Reveal from "@/components/ui/Reveal";
import TransitionContainer from "@/components/ui/TransitionContainer";
import TransitionLink from "@/components/ui/TransitionLink";
import DottedWorldMap from "@/components/ui/DottedWorldMap";
import { HiMiniArrowLongRight } from "react-icons/hi2";
import Interactions from "./components/Interactions";
// import Career from "./components/Career";

const CompanyPage = () => {
  return (
    <TransitionContainer initial={100} exit={-400}>
      <MainLayout className="pt-32 mobile:pt-52 md:pt-60">
        <div>
          <div className="flex flex-col lg:flex-row justify-between w-full gap-10">
            <h1
              className="uppercase text-lg sm:text-xl xl:text-2xl/tight font-normal shrink-0 pt-1 2xl:pt-3"
              id="tagline"
            >
              Companies create products. <br /> Antimatter Creates Impact.
            </h1>
            <div className="max-w-3xl 2xl:max-w-[920px]">
              <p
                className="text-4xl/tight sm:text-5xl/tight 2xl:text-6xl/tight font-semibold"
                id="summary"
              >
                We&apos;re a design-led AI studio turning complex challenges
                into measurable results.
              </p>
              <Reveal
                initialAnim
                y={0}
                className="mt-20 mobile:mt-40 sm:mt-64 flex flex-col sm:flex-row gap-6 capitalize items-center"
              >
                <TransitionLink href="#story">
                  <Button>
                    <span className="">Watch Our Story</span>
                  </Button>
                </TransitionLink>
              </Reveal>
            </div>
          </div>
          <div className="pt-40 mt-40" id="story">
            <Reveal y={30}>
              <h2 className="text-2xl text-foreground/65">OUR STORY</h2>
            </Reveal>
            <div
              className="relative text-3xl/tight sm:text-4xl/tight xl:text-[52px]/tight font-semibold mt-10"
              id="story-container"
            >
              <p id="story-text" className="absolute inset-0 ">
                Antimatter AI operates at the intersection of cutting-edge
                technology and transformative design.
              </p>
              <p className="text-foreground/10">
                Antimatter AI operates at the intersection of cutting-edge
                technology and transformative design.
              </p>
            </div>
            <div className="flex flex-col md:flex-row justify-between mt-32 sm:mt-40 items-center gap-10 md:gap-0">
              <DottedWorldMap variant="company" />
              <p
                className="text-2xl xl:text-3xl font-semibold max-w-md xl:max-w-xl"
                id="story-paragraph"
              >
                Founded in Atlanta by{" "}
                <span className="text-tertiary">
                  marketers, designers, and engineers
                </span>
                , we set out to make AI accessible, human, and visually
                inspiring.
              </p>
            </div>
          </div>
          <div className="py-20 sm:py-40">
            <Reveal>
              <h2 className="text-center text-3xl md:text-4xl font-bold">
                Key highlights{" "}
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xl:gap-5 w-full mt-20 flex-wrap">
              <Reveal>
                <div className="p-8 2xl:p-18 flex flex-col gap-5 pt-32 lg:pt-54 2xl:pt-60 rounded-xl border border-foreground/19 h-full">
                  <h3 className="font-semibold text-3xl md:text-4xl xl:text-5xl max-w-xs">
                    Design-First Innovation
                  </h3>
                  <p className="max-w-xs">
                    Award-winning UI/UX and 3D web experiences
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="p-8 2xl:p-18 flex flex-col gap-5 pt-32 lg:pt-54 2xl:pt-60 rounded-xl border border-foreground/19 h-full">
                  <h3 className="font-semibold text-3xl md:text-4xl xl:text-5xl max-w-xs">
                    Engineering Excellence
                  </h3>
                  <p className="max-w-xs">
                    Next.js, GSAP, Three.js, and scalable AI architectures
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.4} className="sm:col-span-2 lg:col-span-1">
                <div className="p-8 2xl:p-18 flex flex-col gap-5 pt-32 lg:pt-54 2xl:pt-60 rounded-xl border border-foreground/19 h-full">
                  <h3 className="font-semibold text-3xl md:text-4xl xl:text-5xl max-w-3xs md:max-w-xs">
                    Real-World Impact
                  </h3>
                  <p className="max-w-xs">
                    From healthcare to enterprise AI, our work drives measurable
                    outcomes
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
          <div className=" py-20 sm:py-40">
            <Reveal>
              <h2 className="text-center text-3xl md:text-4xl font-bold">
                How We Think
              </h2>
              <p className="text-center italic mt-5 sm:text-xl">
                We don&apos;t just build products — we <br /> build momentum.
              </p>
            </Reveal>
            <Reveal>
              <h3 className="text-2xl text-foreground/65 mt-20">
                CORE BELIEFS
              </h3>
            </Reveal>
            <div className="flex flex-col mt-5">
              {coreBeliefs.map((core, index) => (
                <Reveal
                  key={core}
                  className="py-4 sm:py-8 border-b last:border-b-0 border-foreground/40"
                >
                  <div className="relative pl-10">
                    <h4 className="absolute top-0 left-0 text-foreground/50">{`0${
                      index + 1
                    }`}</h4>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-semibold">
                      {core}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          {/* <div className="py-20 sm:py-40">
            <Career />
          </div> */}
        </div>
      </MainLayout>
      <div className="mobile:h-[900px] md:h-[800px] xl:h-[950px] relative">
        <div className=" w-main mx-auto relative z-10">
          <div className="flex flex-col md:flex-row gap-10 justify-between">
            <div>
              <h2 className="text-xl mobile:text-2xl lg:text-3xl xl:text-4xl">
                Let&apos;s Create Something
              </h2>
              <h3 className="italic text-4xl mobile:text-5xl lg:text-6xl xl:text-7xl font-bold">
                That Matters
              </h3>
            </div>
            <div className="flex flex-col md:items-end">
              <p>
                We&apos;ve built AI for good, for growth, and for the{" "}
                <span className="mobile:block">
                  greater impact. What will we build with you?
                </span>
              </p>
            </div>
          </div>
          <div className="mt-14 md:mt-28 flex flex-col mobile:flex-row gap-6 capitalize mobile:items-center">
            <TransitionLink href={"/contact"}>
              <Button>Start a Project</Button>
            </TransitionLink>
            <div className="flex">
              <TransitionLink
                href={"/work"}
                className="lg:text-xl flex items-center gap-2 border-b hover:border-accent transition-border duration-300"
              >
                Explore Our Work <HiMiniArrowLongRight className="size-7" />
              </TransitionLink>
            </div>
          </div>
        </div>
        <div className="relative mb-20 mobile:absolute wide:pl-20 wide:left-1/2 mobile:top-64 overflow-hidden md:top-44 lg:top-28 xl:top-20 right-0 mobile:-right-24 md:right-0 mt-10">
          <div className="relative w-full mobile:w-4xl lg:w-[950px] xl:w-[1480px] flex justify-end ml-[35%] mobile:ml-0">
            <div className="w-[200%] mobile:w-full grow shrink-0">
              <video
                src="/Antimatter-astronaut-loop-1.mp4"
                autoPlay
                loop
                muted
                playsInline
                poster="/Antimatter-astronaut-fallback.webp"
                className="rotate-12 lg:rotate-0 w-full"
              />
            </div>
            <div className="w-20 absolute right-0 h-full from-20% bg-gradient-to-l top-0 from-background to-transparent" />
          </div>
        </div>
      </div>
      <Interactions />
    </TransitionContainer>
  );
};

export default CompanyPage;

const coreBeliefs = [
  "Design first, always. — Every product starts with empathy and storytelling.",
  "AI should amplify humans, not replace them.",
  "Innovation is only meaningful when it drives impact.",
  "We move fast — but never at the cost of quality or integrity.",
];
