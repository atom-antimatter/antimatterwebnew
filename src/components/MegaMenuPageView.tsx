import Link from "next/link";
import { HiMiniArrowLongRight } from "react-icons/hi2";
import type { ReactNode } from "react";
import type { MegaMenuPage } from "@/lib/mega-menu-pages";

export function MegaMenuPageView({ page }: { page: MegaMenuPage }): ReactNode {
  return (
    <main className="flex-1">
      <section className="bg-background px-6 pt-40 pb-16 md:pt-52 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <span className="text-muted-foreground bg-foreground/5 inline-block rounded-md px-3 py-1 text-xs font-medium tracking-wider uppercase">
            {page.subtitle}
          </span>
          <h1 className="mt-6 max-w-4xl text-4xl font-medium tracking-tight md:text-6xl">
            {page.title}
          </h1>
          <p className="text-foreground/65 mt-6 max-w-3xl text-lg leading-relaxed md:text-xl">
            {page.description}
          </p>
        </div>
      </section>

      <section className="bg-background px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div className="bg-foreground/5 rounded-2xl p-8 border border-foreground/10">
            <h2 className="text-2xl font-medium tracking-tight">What this includes</h2>
            <ul className="text-foreground/65 mt-6 space-y-3 text-base leading-relaxed">
              {page.highlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-foreground/5 rounded-2xl p-8 border border-foreground/10">
            <h2 className="text-2xl font-medium tracking-tight">Expected outcomes</h2>
            <ul className="text-foreground/65 mt-6 space-y-3 text-base leading-relaxed">
              {page.outcomes.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="bg-foreground group mt-8 inline-flex items-center gap-3 rounded-md py-3 pl-5 pr-3 font-medium text-background transition-all duration-500 ease-out hover:rounded-[50px] hover:bg-accent hover:text-foreground"
            >
              <span>Back to homepage</span>
              <span className="bg-background text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110">
                <HiMiniArrowLongRight className="h-5 w-5" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
