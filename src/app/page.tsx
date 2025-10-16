import ClientsSection from "@/components/ClientsSection";
import CTASection from "@/components/CTASection";
import HeroSection from "@/components/HeroSection";
import ServiceSection from "@/components/ServiceSection";
import Testimonial from "@/components/Testimonial";
import LightRays from "@/components/ui/LightRays";
import Loading from "@/components/ui/Loading";
import MainLayout from "@/components/ui/MainLayout";
import TransitionContainer from "@/components/ui/TransitionContainer";
import WorkSection from "@/components/WorkSection";
import Interactions from "@/utils/interactions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Antimatter AI designs and builds high-impact AI products, secure platforms, and modern web experiences.",
};

export default function Home() {
  return (
    <>
      <LightRays />
      <TransitionContainer initial={100} exit={-600}>
        <HeroSection />
        <MainLayout className="pt-40 sm:pt-60 overflow-x-hidden">
          <ServiceSection />
          <WorkSection />
          <Testimonial />
          <ClientsSection />
          <CTASection />
        </MainLayout>
        <Interactions />
      </TransitionContainer>
      <Loading />
    </>
  );
}
