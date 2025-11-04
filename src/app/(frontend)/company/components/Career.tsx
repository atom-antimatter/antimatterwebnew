import React from "react";
import { GoArrowUpRight } from "react-icons/go";

const Career = () => {
  return (
    <>
      <div className="flex flex-col gap-10 lg:flex-row justify-between">
        <h2 className="text-3xl md:text-4xl font-bold">
          Build The Future <br /> With Us
        </h2>
        <div className="max-w-[485px]">
          <p>
            At Antimatter AI, we&apos;re always looking for creative
            technologists, engineers, and storytellers who see the world
            differently.
          </p>
          <p className="mt-6">
            Whether you&apos;re a frontend innovator or a data scientist who
            loves solving human problems — there&apos;s a place for you here.
          </p>
        </div>
      </div>
      <div className="mt-20">
        {careerData.map((positions) => (
          <div
            key={positions.id}
            className="flex flex-col gap-10 sm:gap-5 lg:flex-row justify-between lg:items-center py-5 border-b border-foreground/20 last:border-b-0"
          >
            <h3 className="text-xl font-bold">{positions.title}</h3>
            <div className="flex justify-between  flex-wrap gap-5 lg:max-w-lg xl:max-w-2xl w-full items-center">
              <div className="w-40">
                <h4 className="text-foreground/50">Location</h4>
                <div className="">{positions.location}</div>
              </div>
              <div className="w-40">
                <h4 className="text-foreground/50">Type</h4>
                <div className="">{positions.type}</div>
              </div>
              <div className="flex w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1 border-b cursor-pointer hover:scale-105 duration-150">
                  Apply <GoArrowUpRight />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Career;

const careerData = [
  {
    id: 1,
    title: "Frontend Engineer (Next.js / Three.js)",
    location: "Remote / Atlanta",
    type: "Full-Time",
  },
  {
    id: 2,
    title: "AI Engineer (Python / LangChain / Bedrock)",
    location: "Remote / Hybrid",
    type: "Full-Time",
  },
  {
    id: 3,
    title: "UI/UX Designer (Figma / Framer Motion)",
    location: "Remote",
    type: "Contract or Full-Time",
  },
];
