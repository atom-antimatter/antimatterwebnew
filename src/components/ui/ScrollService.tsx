import { NamedExoticComponent } from "react";
import { ServiceCardProps } from "./ServiceCard";

interface Props {
  serviceCardData: ServiceCardProps[];
  MemoizedServiceCard: NamedExoticComponent<ServiceCardProps>;
  activeIndex: number;
}

const ScrollService = ({
  serviceCardData,
  MemoizedServiceCard,
  activeIndex,
}: Props) => {
  return (
    <div className="flex gap-8 sm:gap-10 flex-row h lg:gap-6 xl:gap-8 w-full">
      {serviceCardData.map((card, index) => (
        <div
          key={card.title}
          className={`service-card  max-w-[390px] sm:max-w-[420px] lg:w-[340px]  xl:w-[380px]  2xl:w-[460px] shrink-0 `}
        >
          <MemoizedServiceCard active={activeIndex === index} {...card} />
        </div>
      ))}
    </div>
  );
};

export default ScrollService;
