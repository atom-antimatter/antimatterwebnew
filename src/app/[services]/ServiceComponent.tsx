"use client";
import Button from "@/components/ui/Button";
import MainLayout from "@/components/ui/MainLayout";
import TitleH1Anim from "@/components/ui/TitleH1Anim";
import TransitionContainer from "@/components/ui/TransitionContainer";
import { ServicesData } from "@/data/services";
import { motion } from "motion/react";
import Link from "next/link";
import { notFound, usePathname } from "next/navigation";

const ServiceComponent = () => {
  const pathname = usePathname();
  const data = ServicesData;
  const service = data.find((value) => value.link === pathname);
  if (!service) notFound();
  return (
    <TransitionContainer>
      <MainLayout>
        <div>
          <TitleH1Anim
            className="text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-semibold uppercase"
            linesClass="overflow-hidden "
          >
            {service?.pageTitle}
          </TitleH1Anim>
          <div className="pt-10 flex gap-6 flex-wrap items-center">
            {service.customCTA ? (
              <>
                <Link href={service.customCTA.href}>
                  <Button variant="primary">
                    <span className="px-8 lg:px-12">{service.customCTA.text}</span>
                  </Button>
                </Link>
                {service.customCTA.secondary && (
                  <Link href={service.customCTA.secondary.href}>
                    <Button variant="inverted">
                      <span className="px-8 lg:px-12">{service.customCTA.secondary.text}</span>
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Link href={"#all-services"}>
                <Button>
                  <span className="px-5 lg:px-10">Read more</span>
                </Button>
              </Link>
            )}
          </div>
          <div className="flex justify-end">
            <p className="mt-20 lg:text-xl xl:text-2xl w-xl xl:w-2xl tracking-wide">
              {service?.description}
            </p>
          </div>
        </div>
        <div id="all-services">
          <h2 className="text-xl lg:text-2xl xl:text-3xl font-extralight uppercase lg:tracking-wide flex gap-3 flex-wrap md:justify-between">
            {service.tagline?.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </h2>
          <div className="mt-14 lg:mt-32">
            {service.items.map(({ title, desc }, index) => (
              <motion.div
                key={title}
                className="border-y border-foreground/40 h-auto md:h-40 xl:h-60 flex gap-5 justify-between md:items-center flex-col md:flex-row py-8"
                initial="hidden"
                whileInView="visible"
                viewport={{
                  amount: 1,
                  margin: "-70px 0px -150px 0px",
                }}
                variants={{
                  hidden: { opacity: 0.2 },
                  visible: {
                    opacity: 1,
                    transition: {
                      duration: 0.3,
                      ease: "easeOut",
                      when: "beforeChildren",
                    },
                  },
                }}
              >
                <motion.h3 className="text-2xl lg:text-4xl xl:text-6xl uppercase font-bold flex gap-3 ">
                  <span className="text-base lg:text-xl align-top font-light lg:pt-1">
                    0{index + 1}
                  </span>
                  <span>{title}</span>
                </motion.h3>
                <motion.p
                  className="md:max-w-lg"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { duration: 0.5, ease: "easeOut" },
                    },
                  }}
                >
                  {desc}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </MainLayout>
    </TransitionContainer>
  );
};

export default ServiceComponent;
