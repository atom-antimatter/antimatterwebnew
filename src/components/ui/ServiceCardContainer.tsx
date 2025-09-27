"use client";
import ServiceCard, { ServiceCardProps } from "./ServiceCard";
import { useActiveIndex } from "@/store";
import { SiFigma, SiSketch, SiAdobexd, SiBlender, SiThreedotjs, SiAbstract, SiReact, SiFlutter, SiNextdotjs, SiNodedotjs, SiDocker, SiTypescript, SiHubspot, SiSalesforce, SiGoogleanalytics, SiMixpanel, SiIntercom, SiZapier, SiAmazonwebservices, SiGooglecloud, SiOkta, SiAuth0, SiTwilio, SiStripe, SiTensorflow, SiPytorch, SiScikitlearn, SiKeras, SiHuggingface, SiLangchain, SiMqtt, SiArduino, SiRaspberrypi, SiNodered, SiZigbee, SiNordicsemiconductor } from "react-icons/si";

const ServiceCardContainer = () => {
  const activeIndex = useActiveIndex((state) => state.activeIndex);
  return (
    <div
      className="flex flex-col items-center gap-8 sm:gap-10 lg:flex-row lg:items-stretch lg:gap-0 w-full max-w-[100vw] lg:max-w-none px-6 lg:px-0 overflow-x-visible overflow-y-visible touch-pan-y"
      id="service-cards"
    >
      {serviceCardData.map((card, index) => (
        <ServiceCard
          key={card.title}
          active={activeIndex === index}
          {...card}
        />
      ))}
    </div>
  );
};

export default ServiceCardContainer;

const serviceCardData: ServiceCardProps[] = [
  {
    number: "01",
    title: "Product Design",
    description:
      "End-to-end product design—from research and UX flows to polished UI systems and developer-ready handoff.",
    services: [
      "User Research & Strategy",
      "UX Flows & Wireframes",
      "UI Systems & Prototypes",
      "Design Ops & Dev Handoff",
    ],
    tools: ["Figma", "Sketch", "Adobe XD", "Blender", "Three.js", "Abstract"],
    toolIcons: [
      <SiFigma key="figma" />,
      <SiSketch key="sketch" />,
      <SiAdobexd key="xd" />,
      <SiBlender key="blender" />,
      <SiThreedotjs key="three" />,
      <SiAbstract key="abstract" />,
    ],
  },
  {
    number: "02",
    title: "Development",
    description:
      "Robust, scalable products across web and mobile—from elegant UIs to reliable APIs and automated DevOps.",
    services: [
      "Frontend Platforms (React / Next)",
      "Backend APIs & Microservices (Node)",
      "Mobile & Cross‑platform (Flutter)",
      "CI/CD & Cloud Ops (Docker)",
    ],
    tools: ["React", "Flutter", "Next.js", "Node.js", "Docker", "TypeScript"],
    toolIcons: [
      <SiReact key="react" />,
      <SiFlutter key="flutter" />,
      <SiNextdotjs key="next" />,
      <SiNodedotjs key="node" />,
      <SiDocker key="docker" />,
      <SiTypescript key="ts" />,
    ],
  },
  {
    number: "03",
    title: "GTM Strategy",
    description:
      "Data-driven go-to-market for SaaS and AI—clear positioning, smart pricing, and repeatable growth loops from ICP to post‑launch analytics.",
    services: [
      "ICP & Segmentation",
      "Positioning, Narrative & Messaging",
      "Pricing & Packaging",
      "Demand Gen & Content Engine",
    ],
    tools: ["HubSpot", "Salesforce", "Google Analytics", "Mixpanel", "Intercom", "Zapier"],
    toolIcons: [
      <SiHubspot key="hubspot" />,
      <SiSalesforce key="salesforce" />,
      <SiGoogleanalytics key="ga" />,
      <SiMixpanel key="mixpanel" />,
      <SiIntercom key="intercom" />,
      <SiZapier key="zapier" />,
    ],
  },
  {
    number: "04",
    title: "Healthcare Apps",
    description:
      "Secure, compliant healthcare software—from telehealth to EHR integrations—built for HIPAA and auditability.",
    services: [
      "HIPAA & PHI Compliance",
      "Telehealth & Patient Portals",
      "EHR Integrations (FHIR / HL7)",
      "Audit Logging & Access Controls",
    ],
    toolIcons: [
      <SiAmazonwebservices key="aws" />,
      <SiGooglecloud key="gcp" />,
      <SiOkta key="okta" />,
      <SiAuth0 key="auth0" />,
      <SiTwilio key="twilio" />,
      <SiStripe key="stripe" />,
    ],
  },
  {
    number: "05",
    title: "AI Development",
    description:
      "Build production‑ready AI—rapid prototyping to deployed models with solid evals, observability, and safety.",
    services: [
      "LLM Apps & Agents (RAG / Tools)",
      "Fine‑tuning & Prompt Optimization",
      "Model Evals, Guardrails & Monitoring",
      "Vision, NLP & Speech Pipelines",
    ],
    toolIcons: [
      // Frameworks & tools
      <SiTensorflow key="tensorflow" />,
      <SiPytorch key="pytorch" />,
      <SiScikitlearn key="sklearn" />,
      <SiKeras key="keras" />,
      <SiHuggingface key="hf" />,
      <SiLangchain key="langchain" />,
    ],
  },
  {
    number: "06",
    title: "IoT Development",
    description:
      "From device firmware to cloud ingestion—secure, reliable IoT systems with OTA updates and real‑time telemetry.",
    services: [
      "Embedded Firmware & Drivers",
      "BLE / Zigbee / LoRa Connectivity",
      "MQTT Ingestion & Stream Processing",
      "Edge AI & OTA Update Pipelines",
    ],
    toolIcons: [
      <SiArduino key="arduino" />,
      <SiRaspberrypi key="raspberrypi" />,
      <SiMqtt key="mqtt" />,
      <SiNodered key="nodered" />,
      <SiZigbee key="zigbee" />,
      <SiNordicsemiconductor key="nordic" />,
    ],
  },
];
