import Reveal from "./ui/Reveal";
import ServiceCardContainer from "./ui/ServiceCardContainer";
import Title from "./ui/Title";

const ServiceSection = () => {
  return (
    <div id="service-section">
      <div className="flex w-full justify-end" id="services">
        <div className="w-full lg:w-3/5 flex flex-col gap-10 ">
          <div className="flex flex-col sm:flex-row gap-10 sm:gap-30 xl:gap-43 justify-between">
            <div className="whitespace-nowrap">
              <Title className="text-3xl xl:text-title/tight">
                Our Services
              </Title>
            </div>
            <Reveal className="font-light max-w-[390px] justify-end">
              <p>
                We offer comprehensive digital solutions that transform your
                business and drive innovation across every touchpoint.
              </p>
            </Reveal>
          </div>
          <Reveal className="relative overflow-visible">
            <div className="hidden lg:block absolute -left-[500px] top-0 h-full w-[500px] bg-gradient-to-r from-background from-75%  to-white/0 z-10"></div>
            <div className="hidden lg:block absolute -right-[100px] lg:-right-[300px] wide:hidden top-0 h-full w-[150px] sm:w-[300px] bg-gradient-to-l from-background from-75%  to-white/0 z-10"></div>
            <ServiceCardContainer />
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default ServiceSection;
