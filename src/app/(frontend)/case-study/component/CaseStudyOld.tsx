"use client";
import CenterTitle from "@/components/ui/CenterTitle";
import TitleH1Anim from "@/components/ui/TitleH1Anim";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Carousel from "./Carousel";
import Reveal from "@/components/ui/Reveal";
const CaseStudy = () => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 200 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="flex flex-col gap-20 lg:gap-30"
      >
        <div className="text-center">
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            transition={{ duration: 1.2 }}
          >
            {" "}
            <TitleH1Anim className="text-6xl lg:text-7xl xl:text-8xl font-semibold">
              {" "}
              Clinix AI{" "}
            </TitleH1Anim>{" "}
          </motion.div>{" "}
          <p className="text-xl lg:text-2xl xl:text-3xl tracking-wide mt-3">
            {" "}
            The Future of Healthcare Documentation{" "}
          </p>{" "}
        </div>{" "}
        <motion.div
          initial={{ y: 200 }}
          animate={{ y: 0 }}
          transition={{ duration: 1 }}
        >
          {" "}
          <Image
            src={"/images/CaseStudies/clinix/clinixai-1.jpg"}
            alt="Clinix AI"
            width={1920}
            height={1080}
            className="rounded-2xl"
          />{" "}
        </motion.div>{" "}
        <div className="flex flex-col md:flex-row justify-between gap-10 xl:gap-0 font-light ">
          {" "}
          <Reveal className="md:max-w-[380px] lg:max-w-[500px]">
            {" "}
            <h3 className="text-foreground/50 ">Summary</h3>{" "}
            <p className="text-base xl:text-lg">
              {" "}
              We co-founded and built Clinix AI as an “AI Operating System for
              healthcare.” The project focused on ambient clinical note
              generation, ICD/CPT code automation, and direct EHR integration.
              Our approach blended compliance (HIPAA, SOC2 readiness) with
              real-time AI workflows, scaling from pilot deployments to
              enterprise interest without venture capital.{" "}
            </p>{" "}
          </Reveal>{" "}
          <div className="flex flex-col gap-10 md:max-w-[350px] xl:max-w-[400px] ">
            {" "}
            <Reveal delay={0.1}>
              {" "}
              <h3 className="text-foreground/50">Tech Stack</h3>{" "}
              <ul className="flex gap-2 mt-2 flex-wrap">
                {" "}
                {TechStack.map((tech) => (
                  <li
                    className="p-1 bg-accent/10 border border-foreground/40 rounded-md"
                    key={tech}
                  >
                    {" "}
                    {tech}{" "}
                  </li>
                ))}{" "}
              </ul>{" "}
            </Reveal>{" "}
            <Reveal delay={0.2}>
              {" "}
              <h3 className="text-foreground/50">Length of Project</h3>{" "}
              <p>
                {" "}
                Ongoing since 2023 <br /> (MVP launched in &lt; 12 months).{" "}
              </p>{" "}
            </Reveal>{" "}
          </div>{" "}
        </div>{" "}
        <div className="text-center">
          {" "}
          <Reveal className="flex justify-center mb-10 ">
            {" "}
            <CenterTitle className="leading-12">
              {" "}
              Clinix AI Testimonial{" "}
            </CenterTitle>{" "}
          </Reveal>{" "}
          <Reveal>
            {" "}
            <iframe
              src="https://www.youtube-nocookie.com/embed/5IKb62-dDxI?si=yfxRPy_64Sc-_vNL"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              className="w-full md:w-[90%] max-w-6xl mx-auto aspect-video"
            ></iframe>{" "}
          </Reveal>{" "}
        </div>{" "}
        <div>
          {" "}
          <div className="grid grid-cols-8 lg:grid-cols-12 grid-rows-8 gap-3 sm:gap-4 h-auto lg:h-[700px] xl:h-[800px] mt-10 sm:mt-30">
            {" "}
            <Reveal
              viewAmount={0}
              className="bg-gradient-to-r from-lightaccent to-primary col-span-4 row-span-2 sm:row-span-3 rounded-2xl p-0.5 sm:p-1 lg:hidden"
            >
              {" "}
              <div className="bg-background rounded-2xl size-full flex items-center justify-center py-8 p-5">
                {" "}
                <h3 className="text-2xl sm:text-4xl md:text-5xl xl:text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-lightaccent to-primary ">
                  {" "}
                  KEY STATS{" "}
                </h3>{" "}
              </div>{" "}
            </Reveal>{" "}
            <Reveal viewAmount={0} className="col-span-4 row-span-5">
              {" "}
              <Image
                src={"/images/CaseStudies/clinix/clinixai-2.jpg"}
                alt="Clinix AI interface view 1"
                width={440}
                height={444}
                className="w-full h-full object-cover rounded-2xl object-top-left"
              />{" "}
            </Reveal>{" "}
            <Reveal
              delay={0.1}
              viewAmount={0}
              className="col-span-4 row-span-3 sm:row-span-2 rounded-2xl bg-gradient-to-bl from-primary to-[#7072E4] px-5 sm:px-8 xl:px-10 flex items-center"
            >
              {" "}
              <h3 className="sm:text-lg md:text-xl xl:text-2xl font-semibold text-lightaccent">
                {" "}
                Projecting <br />{" "}
                <span className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl">
                  {" "}
                  1000+{" "}
                </span>{" "}
                <br /> providers by EOY 2025.{" "}
              </h3>{" "}
            </Reveal>{" "}
            <Reveal
              delay={0.2}
              viewAmount={0}
              className="col-span-4 row-span-5 lg:row-span-3 "
            >
              {" "}
              <Image
                src={"/images/CaseStudies/clinix/clinixai-4.jpg"}
                alt="Clinix AI interface view 2"
                width={440}
                height={260}
                className="w-full h-full object-cover rounded-2xl"
              />{" "}
            </Reveal>{" "}
            <Reveal
              delay={0.3}
              viewAmount={0}
              className="bg-gradient-to-r from-lightaccent to-primary col-span-4 row-span-3 rounded-2xl p-1 lg:block hidden"
            >
              {" "}
              <div className="bg-background rounded-2xl size-full flex items-center justify-center ">
                {" "}
                <h3 className="text-5xl xl:text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-lightaccent to-primary ">
                  {" "}
                  KEY STATS{" "}
                </h3>{" "}
              </div>{" "}
            </Reveal>{" "}
            <Reveal
              delay={0.4}
              viewAmount={0.4}
              className="bg-lightaccent col-span-4 row-span-5 rounded-2xl p-4 sm:p-8 2xl:p-12 flex flex-col "
            >
              {" "}
              <h3 className="text-background/85 font-bold text-5xl sm:text-7xl md:text-8xl xl:text-9xl">
                {" "}
                78%{" "}
              </h3>{" "}
              <h4 className="text-primary text-sm/[1rem] sm:text-xl md:text-[1.750rem] xl:text-4xl mt-5 sm:mt-10 md:mt-20 uppercase font-extrabold md:leading-8 xl:leading-none">
                {" "}
                reduction in <br /> documentation <br /> time per visit.{" "}
              </h4>{" "}
            </Reveal>{" "}
            <Reveal
              delay={0.4}
              viewAmount={0.2}
              className="bg-primary col-span-8 sm:col-span-5 row-span-3 rounded-2xl p-5 sm:p-8 md:p-10 2xl:p-20 flex flex-col justify-center text-lightaccent"
            >
              {" "}
              <h3 className="font-bold text-xl sm:text-2xl md:text-3xl xl:text-4xl">
                {" "}
                Early adoption <br /> across AthenaHealth{" "}
              </h3>{" "}
              <p className="mt-3 sm:mt-5 text-sm sm:text-base md:text-lg xl:text-xl">
                {" "}
                and underserved specialties like OB/GYN, Psych, and Physical
                Therapy.{" "}
              </p>{" "}
            </Reveal>{" "}
            <Reveal
              delay={0.5}
              viewAmount={0.2}
              className="col-span-8 sm:col-span-3 row-span-3 rounded-2xl"
            >
              {" "}
              <Image
                src={"/images/CaseStudies/clinix/clinixai-3.jpg"}
                alt="Clinix AI interface view 3"
                width={322}
                height={258}
                className="w-full h-full object-cover rounded-2xl"
              />{" "}
            </Reveal>{" "}
          </div>{" "}
        </div>{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10 sm:mt-30">
          {" "}
          <Reveal className="col-span-1 p-5 rounded-2xl bg-zinc-200">
            {" "}
            <Image
              src={"/images/CaseStudies/clinix/clinix-5.jpg"}
              alt="Clinix AI pitch deck slide 5"
              width={880}
              height={660}
              className="w-full h-auto rounded-2xl shadow-lg"
            />{" "}
          </Reveal>{" "}
          <Reveal
            delay={0.1}
            className="col-span-1 p-5 rounded-2xl bg-zinc-200"
          >
            {" "}
            <Image
              src={"/images/CaseStudies/clinix/clinix-6.jpg"}
              alt="Clinix AI pitch deck slide 6"
              width={880}
              height={660}
              className="w-full h-auto rounded-2xl shadow-lg"
            />{" "}
          </Reveal>{" "}
          <Reveal className="col-span-1 p-5 rounded-2xl bg-zinc-200">
            {" "}
            <Image
              src={"/images/CaseStudies/clinix/clinix-7.jpg"}
              alt="Clinix AI pitch deck slide 7"
              width={880}
              height={660}
              className="w-full h-auto rounded-2xl shadow-lg"
            />{" "}
          </Reveal>{" "}
          <Reveal
            delay={0.1}
            className="col-span-1 p-5 rounded-2xl bg-zinc-200"
          >
            {" "}
            <Image
              src={"/images/CaseStudies/clinix/clinix-8.jpg"}
              alt="Clinix AI pitch deck slide 8"
              width={880}
              height={660}
              className="w-full h-auto rounded-2xl shadow-lg"
            />{" "}
          </Reveal>{" "}
        </div>{" "}
        <div className="mt-20 md:mt-30">
          {" "}
          <Reveal className=" mb-15">
            {" "}
            <h2 className="text-5xl md:text-6xl text-center">
              Pitch Deck
            </h2>{" "}
          </Reveal>{" "}
          <Reveal delay={0.1}>
            {" "}
            <Carousel images={PitchDeck} />{" "}
          </Reveal>{" "}
        </div>{" "}
      </motion.div>{" "}
    </AnimatePresence>
  );
};
export default CaseStudy;
const PitchDeck = [
  "/images/CaseStudies/clinix/pitchdeck/1.jpg",
  "/images/CaseStudies/clinix/pitchdeck/2.jpg",
  "/images/CaseStudies/clinix/pitchdeck/3.jpg",
  "/images/CaseStudies/clinix/pitchdeck/4.jpg",
  "/images/CaseStudies/clinix/pitchdeck/5.jpg",
  "/images/CaseStudies/clinix/pitchdeck/6.jpg",
  "/images/CaseStudies/clinix/pitchdeck/7.jpg",
  "/images/CaseStudies/clinix/pitchdeck/8.jpg",
  "/images/CaseStudies/clinix/pitchdeck/9.jpg",
  "/images/CaseStudies/clinix/pitchdeck/10.jpg",
  "/images/CaseStudies/clinix/pitchdeck/11.jpg",
  "/images/CaseStudies/clinix/pitchdeck/12.jpg",
  "/images/CaseStudies/clinix/pitchdeck/13.jpg",
  "/images/CaseStudies/clinix/pitchdeck/14.jpg",
];
const TechStack = [
  "Next.js",
  "React",
  "Tailwind",
  "Node.js",
  "Firestore",
  "Vertex AI",
  "LangChain",
  "HIPAA/SOC2-aligned Google Cloud deployment",
];
