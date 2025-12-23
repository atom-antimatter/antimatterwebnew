const frameworkIntro =
  "A concise view of how Atom runs in production deployments.";

const frameworkItems = [
  {
    title: "FRAMEWORK CORE",
    desc: "Compose agents, retrieval, tools, and deterministic UI into end‑to‑end systems. Reuse patterns across products and teams.",
  },
  {
    title: "DEPLOYMENT OPTIONS",
    desc: "Run in public cloud, private cloud, hybrid, on‑prem, or containers. Support Kubernetes and VPC isolation.",
  },
  {
    title: "PROVIDER ABSTRACTION",
    desc: "Switch model and embedding providers as requirements change. Optimize for cost, latency, and policy constraints.",
  },
  {
    title: "GOVERNANCE LAYER",
    desc: "Apply RBAC, audit logs, encryption, and retention policies per environment. Keep sensitive traffic on private networks.",
  },
  {
    title: "EDGE FOOTPRINT",
    desc: "Optionally deploy to Akamai / Linode regions for low latency and residency. Keep high‑availability routing near users.",
  },
];

const AtomAIFrameworkDetails = () => {
  return (
    <section className="py-32 sm:py-40" id="framework-details" aria-labelledby="framework-details-title">
      <h2
        id="framework-details-title"
        className="text-xl lg:text-2xl xl:text-3xl font-extralight uppercase lg:tracking-wide mb-14 lg:mb-32"
      >
        Atom AI Framework & Enterprise Deployments
      </h2>
      <p className="text-sm sm:text-base text-foreground/70 max-w-2xl">
        {frameworkIntro}
      </p>

      <div className="mt-14 lg:mt-32">
        {frameworkItems.map(({ title, desc }, index) => (
          <div
            key={title}
            className="border-y border-foreground/40 h-auto md:h-40 xl:h-60 flex gap-5 justify-between md:items-center flex-col md:flex-row py-8"
          >
            <h3 className="text-2xl lg:text-4xl xl:text-6xl uppercase font-bold flex gap-3">
              <span className="text-base lg:text-xl align-top font-light lg:pt-1">
                0{index + 1}
              </span>
              <span>{title}</span>
            </h3>
            <p className="md:max-w-lg md:text-right">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AtomAIFrameworkDetails;

