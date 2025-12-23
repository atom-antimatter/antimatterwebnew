import ClientsSection from "@/components/ClientsSection";
import CTASection from "@/components/CTASection";
import AtomAIHeroSection from "@/components/AtomAIHeroSection";
import EnterpriseAIPillarsSection from "@/components/EnterpriseAIPillarsSection";
import Testimonial from "@/components/Testimonial";
import LightRays from "@/components/ui/LightRays";
import Loading from "@/components/ui/Loading";
import MainLayout from "@/components/ui/MainLayout";
import TransitionContainer from "@/components/ui/TransitionContainer";
import WorkSection from "@/components/WorkSection";
import Interactions from "@/utils/interactions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atom AI - Enterprise AI Platform",
  description:
    "Enterprise-grade agentic AI platform for deploying secure AI across voice, search, workflows, and decision systems — built for real-world production environments.",
};

export default function EnterpriseAIPage() {
  return (
    <>
      <LightRays />
      <TransitionContainer initial={100} exit={-600}>
        <AtomAIHeroSection />
        <MainLayout className="pt-40 sm:pt-60 overflow-x-hidden">
          <EnterpriseAIPillarsSection />
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

