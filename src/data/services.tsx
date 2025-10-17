import { IconType } from "react-icons";
import { MdOutlineDesignServices } from "react-icons/md";
import { FaCode } from "react-icons/fa6";
import { BsGraphUpArrow } from "react-icons/bs";
import { LuBrain, LuCpu } from "react-icons/lu";
import { RiStethoscopeLine } from "react-icons/ri";
import { HiSpeakerWave } from "react-icons/hi2";

interface ServiceItemProps {
  title: string;
  desc?: string;
  images?: string[];
}

export type ServiceProps = {
  icon: IconType;
  link: string;
  title: string;
  pageTitle?: React.ReactNode;
  description?: string;
  tagline?: string[];
  items: ServiceItemProps[];
  customCTA?: {
    text: string;
    href: string;
    secondary?: {
      text: string;
      href: string;
    };
  };
};

export const ServicesData: ServiceProps[] = [
  {
    icon: MdOutlineDesignServices,
    title: "Product Design",
    link: "/design-agency",
    pageTitle: (
      <>
        You think it. <br /> We{" "}
        <span className="text-secondary font-bold italic pr-2">DESIGN</span> it.
      </>
    ),
    description:
      "From initial sketches to prototypes fully custom apps, we're your design partner. With a modern approach and cutting-edge tools, we shape every pixel with precision because every detail matters.",
    tagline: [
      "Human creativity.",
      "AI-enhanced speed.",
      "Designs that think ahead.",
    ],
    items: [
      { title: "User Research & Strategy" },
      { title: "UX Flows & Wireframes" },
      { title: "UI Systems & Prototypes" },
      { title: "Design Ops & Dev Handoff" },
    ],
  },
  {
    icon: FaCode,
    title: "Development",
    link: "/development-agency",
    pageTitle: (
      <>
        Software Developers <br /> you can{" "}
        <span className="text-secondary font-bold italic mr-3">count on.</span>
      </>
    ),
    description:
      "From concept to digital reality, we build across all devices, languages, and platforms. Every line of code is crafted with care, ensuring seamless functionality and exceptional performance. Here, every detail matters.",
    tagline: ["We make tech that", "just makes sense."],
    items: [
      { title: "Frontend Platforms (React / Next)" },
      { title: "Backend APIs & Microservices (Node)" },
      { title: "Mobile & Cross‑platform (Flutter)" },
      { title: "CI/CD & Cloud Ops (Docker)" },
    ],
  },
  {
    icon: BsGraphUpArrow,
    link: "/gtm-strategy",
    title: "GTM Strategy",
    pageTitle: (
      <>
        <span className="text-secondary font-bold italic mr-3">
          Drive Conversions,
        </span>{" "}
        <br />
        Not Useless Traffic
      </>
    ),
    description:
      "From strategy to execution, we craft marketing campaigns that resonate across all platforms. Every piece of content is designed with purpose, ensuring maximum impact and engagement. Here, every interaction matters.",
    tagline: ["Campaigns people connect with."],
    items: [
      { title: "ICP & Segmentation" },
      { title: "Positioning, Narrative & Messaging" },
      { title: "Pricing & Packaging" },
      { title: "Demand Gen & Content Engine" },
    ],
  },
  {
    icon: LuBrain,
    link: "/ai-development",
    title: "AI Development",
    pageTitle: (
      <>
        AI Development with <br />
        <span className="text-secondary font-bold italic mr-3">
          Human Touch
        </span>
      </>
    ),
    description:
      "From concept to intelligent systems, we build AI that thinks ahead. Leveraging advanced machine learning and neural networks, our solutions integrate seamlessly, making smarter decisions with minimal human input. Here, every decision matters.",
    tagline: ["AI that works,", "driven by expert logic."],
    items: [
      { title: "LLM Apps & Agents (RAG / Tools)" },
      { title: "Fine‑tuning & Prompt Optimization" },
      { title: "Model Evals, Guardrails & Monitoring" },
      { title: "Vision, NLP & Speech Pipelines" },
    ],
  },
  {
    icon: RiStethoscopeLine,
    link: "/healthcare-apps",
    title: "Healthcare Apps",
    pageTitle: (
      <>
        Web3 Solutions
        <br />
        that
        <span className="text-secondary font-bold italic mr-3">Make Sense</span>
      </>
    ),
    description:
      "Secure, compliant healthcare software—from telehealth to EHR integrations—built for HIPAA and auditability.",
    tagline: ["Healthcare,", "designed for compliance."],
    items: [
      { title: "HIPAA & PHI Compliance" },
      { title: "Telehealth & Patient Portals" },
      { title: "EHR Integrations (FHIR / HL7)" },
      { title: "Audit Logging & Access Controls" },
    ],
  },
  {
    icon: LuCpu,
    link: "/iot-development",
    title: "IoT Development",
    pageTitle: (
      <>
        Build, connect, update
        <br />
        <span className="text-secondary font-bold italic mr-3">at the edge</span>
      </>
    ),
    description:
      "From device firmware to cloud ingestion—secure, reliable IoT systems with OTA updates and real‑time telemetry.",
    tagline: ["Hardware + Cloud,", "working together."],
    items: [
      { title: "Embedded Firmware & Drivers" },
      { title: "BLE / Zigbee / LoRa Connectivity" },
      { title: "MQTT Ingestion & Stream Processing" },
      { title: "Edge AI & OTA Update Pipelines" },
    ],
  },
  {
    icon: HiSpeakerWave,
    link: "/voice-agents",
    title: "Voice Agents",
    pageTitle: (
      <>
        Voice Agents that <br />
        <span className="text-secondary font-bold italic mr-3">just work</span>
      </>
    ),
    description:
      "From concept to conversational AI, we build voice agents powered by OpenAI's Realtime API. Trained on your content, seamlessly integrated, and ready to engage your customers 24/7. Here, every conversation matters.",
    tagline: ["Natural conversations,", "powered by AI."],
    items: [
      { 
        title: "AI Call Centers & Receptionists",
        desc: "Intelligent phone systems powered by OpenAI, Hume, and ElevenLabs. Handle customer calls, schedule appointments, answer FAQs, and route inquiries 24/7 with human-like empathy."
      },
      { 
        title: "Multi-Provider Integration",
        desc: "Flexible implementation across OpenAI Realtime API, Hume EVI, Vapi, Bland AI, and more. We select the best provider for your use case—whether it's emotional intelligence, latency, or cost."
      },
      { 
        title: "Custom Training & Knowledge Base",
        desc: "Train your voice agent on your company's content, documentation, and workflows. From website scraping to CRM integration, your agent becomes an expert on your business."
      },
      { 
        title: "Appointment Scheduling & Automation",
        desc: "Seamless calendar integration with Google Calendar, Calendly, and booking systems. Your AI agent can schedule, reschedule, and send reminders—no human intervention needed."
      },
    ],
    customCTA: {
      text: "Try Antimatter Voice Agent",
      href: "/voice-agent-demo",
      secondary: {
        text: "Build Your Own",
        href: "/contact",
      },
    },
  },
];
