import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GoArrowUpRight } from "react-icons/go";

export interface ServiceCardProps {
  title: string;
  number: string;
  active?: boolean;
  description?: string;
  services?: string[];
  tools?: string[];
  toolIcons?: React.ReactNode[];
}

const ServiceCard = (props: ServiceCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardRootRef = useRef<HTMLDivElement>(null);
  const h3Ref = useRef<HTMLHeadingElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  // On mobile, keep consistent background; on large screens, highlight active card
  const bgcolor = props.active
    ? "lg:bg-primary bg-[url('/images/service-card-bg.png')] bg-cover bg-bottom-right bg-no-repeat"
    : "bg-[url('/images/service-card-bg.png')] bg-cover bg-bottom-right bg-no-repeat";

  useEffect(() => {
    // Simple appear-on-scroll for mobile only
    if (typeof window !== "undefined" && cardRootRef.current) {
      const isMobile = window.matchMedia("(max-width: 1023px)").matches;
      if (isMobile) {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
          gsap.fromTo(
            cardRootRef.current,
            { autoAlpha: 0, y: 24, scale: 0.98 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: cardRootRef.current!,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        }, cardRootRef);
        return () => ctx.revert();
      }
    }
  }, []);

  useEffect(() => {
    // Desktop-only transform logic; keep natural flow on mobile
    if (typeof window !== "undefined") {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (!isDesktop) {
        if (h3Ref.current) h3Ref.current.style.transform = "none";
        if (card2Ref.current) card2Ref.current.style.paddingTop = `0px`;
        return;
      }
    }
    if (h3Ref.current && cardRef.current && card2Ref.current) {
      const h3Height = h3Ref.current.offsetHeight;
      const cardHeight = cardRef.current.offsetHeight;
      card2Ref.current.style.paddingTop = `${h3Height + 60}px`;
      if (props.active) {
        h3Ref.current.style.transform = `scale(1.3)`;
      } else {
        h3Ref.current.style.transform = `translateY(${
          cardHeight - h3Height
        }px) scale(1)`;
      }
    }
  }, [props.active]);

  return (
    <div ref={cardRootRef} className="service-card w-full max-w-[390px] sm:max-w-[420px] lg:max-w-none lg:w-auto">
      <div
        className={`p-[1px] grow shrink-0 relative border border-zinc-600 lg:border-zinc-700 ring-1 lg:ring-0 ring-white/20 ring-inset shadow-none overflow-hidden rounded-3xl w-full max-w-[390px] sm:max-w-[420px] h-auto min-h-[460px] lg:w-[340px] lg:h-[380px] xl:w-[380px] xl:h-[420px] 2xl:w-[460px] 2xl:h-[520px] ${bgcolor} duration-300 scale-100 ${
          props.active ? "lg:scale-100" : "lg:scale-90"
        }`}
      >
        <div className={`p-5 sm:p-6 2xl:p-10 h-full relative z-10`}>
          <div
            className={`w-full h-full duration-200 ${bgcolor} absolute inset-0 rounded-3xl`}
          ></div>

          <div className="relative h-full z-10" ref={cardRef}>
            <div className="flex items-center justify-between lg:block">
              <h3
                className={`text-xl pr-1 2xl:text-2xl font-semibold left-0 duration-800 ease-in-out top-0 lg:absolute origin-top-left `}
                ref={h3Ref}
              >
                {props.title}
              </h3>
              <GoArrowUpRight className="size-8 sm:size-9 lg:size-10 relative lg:absolute lg:right-0 lg:top-0" />
            </div>
            <div
              className={`${
                props.active ? "lg:-translate-y-full" : "lg:pt-0"
              } duration-800 ease-in-out lg:h-full`}
            >
              <div className="flex flex-col h-auto lg:h-full relative mb-4 sm:mb-6">
                <div className="flex justify-between">
                  <h4 className="hidden sm:block text-3xl sm:text-4xl font-semibold">{props.number}</h4>
                </div>
              </div>
              <div
                className="flex flex-col gap-6 lg:gap-8 lg:justify-between h-auto lg:h-full"
                ref={card2Ref}
              >
                <div className="flex justify-between">
                  <p className="text-sm 2xl:text-base">{props.description}</p>
                </div>
                <div className="flex gap-6 justify-between flex-col sm:flex-row sm:gap-8">
                  <div>
                    <h3 className="text-foreground/60 text-lg">Services</h3>
                    <div className="flex flex-col text-sm gap-1">
                      {props.services?.map((service, index) => (
                        <span key={index} className="">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-foreground/60 text-lg">Tools</h3>
                    {props.toolIcons && props.toolIcons.length > 0 ? (
                      <div className="grid grid-cols-3 gap-x-1 gap-y-3 sm:gap-x-2 sm:gap-y-4 lg:gap-x-4 lg:gap-y-4 pt-1">
                        {props.toolIcons.map((IconNode, index) => (
                          <span
                            key={index}
                            className="text-3xl sm:text-4xl opacity-90"
                            aria-hidden
                          >
                            {IconNode}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-x-1 gap-y-3 sm:gap-x-2 sm:gap-y-4 lg:gap-x-4 lg:gap-y-4 pt-1 text-sm">
                        {props.tools?.map((tool, index) => (
                          <span key={index} className="">
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block absolute inset-0 -translate-1/2 size-[500px] bg-radial from-[#B4B5ED] via-[696AAC] to-transparent"></div>
      </div>
    </div>
  );
};

export default ServiceCard;
