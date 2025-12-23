import { EnterpriseAIPillarCardProps } from "@/data/enterpriseAIPillars";
import { GoArrowRight } from "react-icons/go";

const EnterpriseAIPillarCard = (props: EnterpriseAIPillarCardProps) => {
  const bgcolor = props.active
    ? "lg:bg-primary lg:bg-none bg-[url('/images/service-card-bg.png')] bg-cover bg-bottom-right bg-no-repeat"
    : "bg-[url('/images/service-card-bg.png')] bg-cover bg-bottom-right bg-no-repeat";

  return (
    <div
      className={`w-full block duration-500 transition-transform ease-out group relative ${
        props.active ? "z-10" : "z-0"
      }`}
    >
      <div
        className={`p-[1px] grow shrink-0 relative border border-zinc-600 lg:border-zinc-700 ring-1 lg:ring-0 ring-white/20 ring-inset shadow-none overflow-hidden rounded-3xl w-full h-[560px] ${bgcolor} duration-500 ${
          props.active ? "scale-100" : "scale-95"
        }`}
      >
        <div className={`px-5 py-8 sm:py-10 sm:px-10 h-full relative z-10`}>
          <div
            className={`w-full h-full duration-200 ${bgcolor} absolute inset-0 rounded-3xl`}
          ></div>
          <div className="h-full relative">
            <div className="-rotate-45 absolute right-0 top-0 overflow-hidden size-8 sm:size-9 lg:size-10">
              <div className="relative group-hover:translate-x-full transition-transform duration-300 ease-[cubic-bezier(.15,-0.26,.43,1.41)]">
                <GoArrowRight className="size-full" />
                <GoArrowRight className="size-full absolute right-full top-0" />
              </div>
            </div>
            <div className="relative h-full z-10 flex flex-col">
              <div className="flex flex-col gap-3">
                <h4 className="block text-3xl sm:text-4xl font-semibold">
                  {props.number}
                </h4>
                <h2 className="text-xl pr-1 2xl:text-2xl font-semibold">
                  {props.title}
                </h2>
              </div>

              <div className="flex-1 flex flex-col justify-between pt-6">
                <div className="flex justify-between">
                  <p className="text-sm 2xl:text-base leading-relaxed">
                    {props.description}
                  </p>
                </div>

                <div className="pt-8">
                  <h3 className="text-foreground/60 text-lg mb-3">
                    {props.iconLabel}
                  </h3>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-3">
                    {props.features?.map((feature, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-start gap-1"
                        title={feature.tooltip}
                      >
                        <span className="text-xl opacity-90" aria-hidden="true">
                          {feature.icon}
                        </span>
                        <span className="text-xs text-foreground/70 leading-tight">
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="block absolute inset-0 -translate-1/2 size-[500px] bg-radial from-[#B4B5ED] via-[696AAC] to-transparent"></div>
      </div>
    </div>
  );
};

export default EnterpriseAIPillarCard;

