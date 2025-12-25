"use client";

import { KeyRound, Server, Shuffle } from "lucide-react";

const VALUE_PROPS = [
  {
    key: "deploy",
    title: "Deploy Anywhere",
    Icon: Server,
  },
  {
    key: "controls",
    title: "RBAC + Audit Trails",
    Icon: KeyRound,
  },
  {
    key: "flex",
    title: "Provider Flexibility",
    Icon: Shuffle,
  },
] as const;

const AtomValuePropsSection = () => {
  return (
    <div className="md:hidden w-full px-6 pt-12 pb-16">
      <div className="w-full max-w-[420px] mx-auto">
        <div className="grid grid-cols-1 gap-3 text-left">
          {VALUE_PROPS.map(({ key, title, Icon }) => (
            <div
              key={key}
              className="rounded-2xl border border-foreground/10 bg-background/20 backdrop-blur px-4 py-4 transition-colors hover:bg-background/30"
            >
              <div className="flex items-center gap-3">
                <div className="size-11 shrink-0 rounded-xl border border-foreground/10 bg-white/5 flex items-center justify-center">
                  <Icon
                    className="size-[22px] text-tertiary/90"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold leading-tight text-foreground">
                    {title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AtomValuePropsSection;

