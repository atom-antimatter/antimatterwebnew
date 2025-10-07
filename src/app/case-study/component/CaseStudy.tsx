"use client";
import CenterTitle from "@/components/ui/CenterTitle";
import MainLayout from "@/components/ui/MainLayout";
import Reveal from "@/components/ui/Reveal";
import TitleH1Anim from "@/components/ui/TitleH1Anim";
import TransitionContainer from "@/components/ui/TransitionContainer";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Carousel from "./Carousel";

type CaseStudyProps = {
  title: string;
  subtitle: string;
  heroImage: string;
  summary: string;
  techStack: string[];
  projectLength: string;
  testimonial?: {
    title: string;
    videoUrl: string;
  };
  stats?: React.ReactNode;
  gallery?: string[];
  pitchDeck?: string[];
};

const CaseStudy = ({
  title,
  subtitle,
  heroImage,
  summary,
  techStack,
  projectLength,
  testimonial,
  stats,
  gallery,
  pitchDeck,
}: CaseStudyProps) => {
  return (
    <TransitionContainer initial={100} exit={-400}>
      <AnimatePresence>
        <div>
          <MainLayout className="pt-40">
            <motion.div
              initial={{ opacity: 0, y: 200 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex flex-col gap-20 lg:gap-30"
            >
              <div className="">
                <motion.div
                  initial={{ x: 400 }}
                  animate={{ x: 0 }}
                  transition={{ duration: 1.2 }}
                >
                  <TitleH1Anim
                    className="text-6xl lg:text-8xl xl:text-9xl font-semibold"
                    linesClass="overflow-hidden py-5"
                  >
                    {title}.
                  </TitleH1Anim>
                </motion.div>
                <p className="text-xl  tracking-wide mt-3">{subtitle}</p>
              </div>
              <motion.div
                initial={{ y: 200 }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <Image
                  src={heroImage}
                  alt={title}
                  width={1920}
                  height={1080}
                  className="rounded-2xl"
                />
              </motion.div>
              {/* Summary & Tech */}
              <div className="flex flex-col md:flex-row justify-between gap-10 xl:gap-0 font-light">
                <Reveal className="md:max-w-[380px] lg:max-w-[600px]">
                  <h3 className="text-foreground/50">Summary</h3>
                  <p className="text-base xl:text-lg">{summary}</p>
                </Reveal>
                <div className="flex flex-col gap-10 md:max-w-[350px] xl:max-w-[400px]">
                  <Reveal delay={0.1}>
                    <h3 className="text-foreground/50">Tech Stack</h3>
                    <ul className="flex gap-2 mt-2 flex-wrap">
                      {techStack.map((tech) => (
                        <li
                          key={tech}
                          className="p-1 bg-accent/10 border border-foreground/40 rounded-md"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                  <Reveal delay={0.2}>
                    <h3 className="text-foreground/50">Length of Project</h3>
                    <p>{projectLength}</p>
                  </Reveal>
                </div>
              </div>
              {/* Testimonial */}
              {testimonial && (
                <div className="text-center">
                  <Reveal className="flex justify-center mb-10">
                    <CenterTitle className="leading-12">
                      {testimonial.title}
                    </CenterTitle>
                  </Reveal>
                  <Reveal>
                    <iframe
                      src={testimonial.videoUrl}
                      title={`${title} testimonial`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="w-full md:w-[90%] max-w-6xl mx-auto aspect-video"
                    ></iframe>
                  </Reveal>
                </div>
              )}
              {/* Stats */}
              {stats && <div>{stats}</div>}
              {/* Gallery */}
              {gallery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10 sm:mt-30">
                  {gallery.map((img, i) => (
                    <Reveal
                      key={i}
                      delay={i * 0.1}
                      className="col-span-1 p-5 rounded-2xl bg-zinc-200"
                    >
                      <Image
                        src={img}
                        alt={`${title} gallery ${i + 1}`}
                        width={880}
                        height={660}
                        className="w-full h-auto rounded-2xl shadow-lg"
                      />
                    </Reveal>
                  ))}
                </div>
              )}
              {/* Pitch Deck */}
            </motion.div>
          </MainLayout>
          {pitchDeck && (
            <div className="mt-20 md:mt-30 ">
              <Reveal className="mb-15">
                <h2 className="text-5xl md:text-6xl text-center">Pitch Deck</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="mb-60 w-screen  overflow-hidden">
                  <div className="w-main mx-auto">
                    <Carousel images={pitchDeck} />
                  </div>
                </div>
              </Reveal>
            </div>
          )}
        </div>
      </AnimatePresence>
    </TransitionContainer>
  );
};

export default CaseStudy;
