import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MegaMenuPageView } from "@/components/MegaMenuPageView";
import { createMetadata } from "@/lib/metadata";
import { megaMenuPageMap, megaMenuPages } from "@/lib/mega-menu-pages";
import type { ReactNode } from "react";
import MainLayout from "@/components/ui/MainLayout";
import TransitionContainer from "@/components/ui/TransitionContainer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return megaMenuPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = megaMenuPageMap.get(slug);

  if (!page) {
    return createMetadata({
      title: "Explore",
      description: "Explore Antimatter AI capabilities and focus areas.",
      path: `/explore/${slug}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: page.title,
    description: page.description,
    path: `/explore/${slug}`,
  });
}

export default async function ExploreSubpage({ params }: PageProps): Promise<ReactNode> {
  const { slug } = await params;
  const page = megaMenuPageMap.get(slug);

  if (!page) {
    notFound();
  }

  return (
    <TransitionContainer initial={100} exit={-400}>
      <MainLayout className="pt-32 mobile:pt-52 md:pt-60">
        <MegaMenuPageView page={page} />
      </MainLayout>
    </TransitionContainer>
  );
}
