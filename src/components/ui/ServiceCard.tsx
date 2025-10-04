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
  const bgcolor = props.active
    ? "lg:bg-primary lg:bg-none bg-[url('/images/service-card-bg.png')] bg-cover bg-bottom-right bg-no-repeat"
    : "bg-[url('/images/service-card-bg.png')] bg-cover bg-bottom-right bg-no-repeat";

  return (
    <div className="w-full">
      <div
        className={`p-[1px] grow shrink-0 relative border border-zinc-600 lg:border-zinc-700 ring-1 lg:ring-0 ring-white/20 ring-inset shadow-none overflow-hidden rounded-3xl w-full h-[560px] ${bgcolor} duration-500 ${
          props.active ? "scale-100" : "scale-90"
        }`}
      >
        <div className={`px-5 py-8 sm:py-10  sm:px-10 h-full relative z-10`}>
          <div
            className={`w-full h-full duration-200 ${bgcolor} absolute inset-0 rounded-3xl`}
          ></div>
          <div className="h-full relative">
            <GoArrowUpRight className="size-8 sm:size-9 lg:size-10 absolute right-0 top-0" />
            <div
              className={`relative h-full z-10 duration-500 ${
                props.active && "-translate-y-full"
              }`}
            >
              <div className="flex flex-col justify-between h-full">
                <h4 className="block text-3xl sm:text-4xl font-semibold">
                  {props.number}
                </h4>
                <h2
                  className={`text-xl pr-1 2xl:text-2xl font-semibold origin-top-left transition-transform will-change-transform duration-500 ${
                    props.active ? "scale-120 translate-y-full" : "scale-100"
                  }`}
                >
                  {props.title}
                </h2>
              </div>
              <div className="flex flex-col gap-6 justify-between h-full">
                <h2
                  className={`text-xl pr-1 2xl:text-2xl font-semibold opacity-0`}
                >
                  {props.title}
                </h2>
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
                      <div className="grid grid-cols-3 gap-x-1 gap-y-3 sm:gap-x-2 sm:gap-y-4 lg:gap-x-4 lg:gap-y-4 pt-1 w-[100px] text-center">
                        {props.toolIcons.map((IconNode, index) => (
                          <span
                            key={index}
                            className="text-2xl sm:text-2xl lg:text-2xl xl:text-3xl opacity-90"
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
        <div className="block absolute inset-0 -translate-1/2 size-[500px] bg-radial from-[#B4B5ED] via-[696AAC] to-transparent"></div>
      </div>
    </div>
  );
};

export default ServiceCard;
