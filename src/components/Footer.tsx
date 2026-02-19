import Link from "next/link";
import { GoArrowUpRight } from "react-icons/go";
import AtlantaClock from "./ui/AtlantaClock";
import TransitionLink from "./ui/TransitionLink";

const Footer = () => {
  return (
    <div className="w-full relative overflow-hidden">
      <div className="w-main mx-auto pb-5 md:pb-10 relative z-20">
        <div className="flex flex-col md:flex-row gap-20 md:gap-5 justify-between">
          <div className="flex flex-col font-light text-lg">
            <p className="text-2xl">atom@antimatterai.com</p>
            <div className="flex mt-3">
              <a
                href="https://www.linkedin.com/company/antimatter-ai/"
                target="_blank"
                className="flex items-center border-b pb-0.5"
              >
                Linkedin <GoArrowUpRight className={`size-4`} />
              </a>
            </div>
            <div className="flex flex-col mt-10">
              <div className="flex flex-col lg:flex-row gap-0 lg:gap-4">
                <p>Based in Atlanta, GA</p>
                <p className="opacity-50">Serving clients globally</p>
              </div>
              <h3 className="font-semibold text-5xl sm:text-6xl lg:text-8xl mt-2">
                <AtlantaClock />
              </h3>
            </div>
          </div>
          <div className="flex flex-col xs:flex-row flex-wrap justify-between sm:justify-normal gap-10 sm:gap-50 md:gap-20 lg:gap-30">
            <div>
              <h2 className="text-foreground/50 mb-2">Services</h2>
              <div className="flex flex-col gap-2">
                <TransitionLink href={"/design-agency"}>
                  Product Design
                </TransitionLink>
                <TransitionLink href={"/development-agency"}>
                  Development
                </TransitionLink>
                <TransitionLink href={"/gtm-strategy"}>
                  GTM Strategy
                </TransitionLink>
                <TransitionLink href={"/healthcare-apps"}>
                  Healthcare Apps
                </TransitionLink>
                <TransitionLink href={"/ai-development"}>
                  AI Development
                </TransitionLink>
                <TransitionLink href={"/iot-development"}>
                  IoT Development
                </TransitionLink>
              </div>
            </div>
            <div>
              <h2 className="text-foreground/50 mb-2">Solutions</h2>
              <div className="flex flex-col gap-2">
                <TransitionLink href={"/agentic-ai"}>
                  Agentic AI
                </TransitionLink>
                <TransitionLink href={"/voice-agents"}>
                  Voice Agents
                </TransitionLink>
               <TransitionLink href={"/emotion-ai"}>
                 Sentiment AI
               </TransitionLink>
              </div>
            </div>
            <div>
              <h2 className="text-foreground/50 mb-2">Resources</h2>
              <div className="flex flex-col gap-2">
                <Link href={"/resources/vendor-matrix"}>
                  AI Vendor Matrix
                </Link>
                <Link href={"/case-study/clinixAI"}>Clinix AI</Link>
                <Link href={"/case-study/synergies4"}>Synergies4</Link>
                <Link href={"/case-study/curehire"}>Curehire</Link>
                <Link href={"/case-study/feature"}>Feature</Link>
                <Link href={"/case-study/owasp"}>OWASP</Link>
                <Link href={"/contact"}>Contact</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row mt-20 gap-10 md:gap-5 justify-between font-light">
          <p className=" text-foreground/50 text-center">
            Antimatter AI, © 2026. All rights reserved.
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-primary blur-3xl scale-150">
        <div className="absolute left-0 bottom-20 w-full h-full scale-y-200 origin-bottom rounded-[100%] bg-background"></div>
      </div>
    </div>
  );
};

export default Footer;
