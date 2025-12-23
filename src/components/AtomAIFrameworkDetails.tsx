const frameworkItems = [
  {
    title: "ATOM AI FRAMEWORK",
    desc: "A modular, agentic AI framework for building search, voice, workflow, and decision systems. Atom supports deterministic GenUI, RAG, tool calling, and multi-agent orchestration—designed for production from day one.",
  },
  {
    title: "DEPLOYMENT MODELS",
    desc: "Deploy Atom in public cloud, private cloud, hybrid, on-prem, or fully containerized environments. Supports Kubernetes, VPC isolation, and enterprise networking requirements.",
  },
  {
    title: "MODEL-AGNOSTIC ARCHITECTURE",
    desc: "Run OpenAI, Anthropic, open-source, or private models interchangeably. Atom abstracts model providers to prevent lock-in and enable cost, latency, and compliance optimization.",
  },
  {
    title: "SECURITY & GOVERNANCE",
    desc: "Enterprise-grade controls including encryption at rest/in transit, audit logs, RBAC, SSO, private networking, and zero-training guarantees.",
  },
  {
    title: "EDGE & PERFORMANCE",
    desc: "Optional edge deployment via Akamai / Linode for ultra-low latency inference, regional data residency, and high-availability workloads.",
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

