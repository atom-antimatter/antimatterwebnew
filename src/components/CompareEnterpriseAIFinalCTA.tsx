"use client";

import Button from "@/components/ui/Button";
import TransitionLink from "@/components/ui/TransitionLink";
import CompareEnterpriseAICTA from "@/components/ui/CompareEnterpriseAICTA";

export default function CompareEnterpriseAIFinalCTA() {
  return (
    <section
      aria-label="Compare Enterprise AI"
      className="mt-24 sm:mt-32 mb-24 sm:mb-32 rounded-2xl border border-foreground/15 bg-background/20 backdrop-blur px-6 sm:px-10 py-10 sm:py-12"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Compare vendors side-by-side.
          </h2>
          <p className="mt-2 text-sm text-foreground/70 max-w-[60ch]">
            See how Atom stacks up across deployment, security, and IP ownership.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
          <div className="w-full sm:w-auto">
            <CompareEnterpriseAICTA location="footer" variant="primary" />
          </div>
          <TransitionLink href="/contact" className="w-full sm:w-auto">
            <Button variant="inverted">
              <span className="px-8">Talk to our team</span>
            </Button>
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}


