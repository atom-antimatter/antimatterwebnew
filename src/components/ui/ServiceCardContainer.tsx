"use client";
import ServiceCard, { ServiceCardProps } from "./ServiceCard";
import { useActiveIndex } from "@/store";
import "swiper/css";
import {
  SiFigma,
  SiSketch,
  SiAdobexd,
  SiBlender,
  SiThreedotjs,
  SiAbstract,
  SiReact,
  SiFlutter,
  SiNextdotjs,
  SiNodedotjs,
  SiDocker,
  SiTypescript,
  SiHubspot,
  SiSalesforce,
  SiGoogleanalytics,
  SiMixpanel,
  SiIntercom,
  SiZapier,
  SiAmazonwebservices,
  SiGooglecloud,
  SiOkta,
  SiAuth0,
  SiTwilio,
  SiStripe,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
  SiKeras,
  SiHuggingface,
  SiLangchain,
  SiMqtt,
  SiArduino,
  SiRaspberrypi,
  SiNodered,
  SiZigbee,
  SiNordicsemiconductor,
} from "react-icons/si";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { memo, useCallback, useState } from "react";
import type { Swiper as SwiperTypes } from "swiper/types";
import {
  HiOutlineArrowLongLeft,
  HiOutlineArrowLongRight,
} from "react-icons/hi2";

const MemoizedServiceCard = memo(function ServiceCardWrapper(
  props: ServiceCardProps
) {
  return <ServiceCard {...props} />;
});

const ServiceCardContainer = () => {
  const activeIndex = useActiveIndex((state) => state.activeIndex);
  const setActiveIndex = useActiveIndex((state) => state.setActiveIndex);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [breakpoint, setBreakpoint] = useState("");

  //  Bullet rendering moved fully into React
  const renderBullet = useCallback(
    (index: number, className: string) => {
      let extraClass = "";
      if (index === activeIndex) extraClass = "active";
      else if (index === activeIndex - 1 || index === activeIndex + 1)
        extraClass = "neighbor";

      return `<span class="${className} custom-bullet block w-1 h-7 bg-foreground/70 hover:bg-foreground mx-[3px] transition-transform duration-300 ${extraClass}"></span>`;
    },
    [activeIndex]
  );
  const updateBullets = (swiper: SwiperTypes) => {
    const bullets = document.querySelectorAll(".custom-bullet");
    bullets.forEach((b, i) => {
      b.classList.remove("active", "neighbor");
      if (i === swiper.activeIndex) b.classList.add("active");
      if (i === swiper.activeIndex - 1 || i === swiper.activeIndex + 1)
        b.classList.add("neighbor");
    });
    setActiveIndex(swiper.activeIndex);
  };

  const handleSlideChange = useCallback(
    (swiper: SwiperTypes) => {
      setActiveIndex(swiper.activeIndex);
      setIsBeginning(swiper.isBeginning);
      setIsEnd(swiper.isEnd);
      updateBullets(swiper);
    },
    [setActiveIndex]
  );

  return (
    <div id="service-cards">
      {/* Navigation & Pagination */}
      <div className="flex mb-8 justify-between items-center">
        <div
          className={`px-5 border border-foreground/30 rounded-full transition-colors slider-prev
          ${
            isBeginning
              ? "opacity-30 pointer-events-none"
              : "hover:bg-foreground/10 cursor-pointer"
          }`}
        >
          <HiOutlineArrowLongLeft className="size-7 sm:size-10" />
        </div>

        <div className="slider-pagination flex cursor-pointer"></div>

        <div
          className={`px-5 border border-foreground/30 rounded-full transition-colors slider-next
          ${
            isEnd
              ? "opacity-30 pointer-events-none"
              : "hover:bg-foreground/10 cursor-pointer"
          }`}
        >
          <HiOutlineArrowLongRight className="size-7 sm:size-10" />
        </div>
      </div>

      {/* Swiper */}
      <Swiper
        className="overflow-visible w-full"
        slidesPerView={1}
        slidesOffsetAfter={30}
        modules={[Navigation, Pagination]}
        spaceBetween={5}
        navigation={{
          nextEl: ".slider-next",
          prevEl: ".slider-prev",
        }}
        pagination={{
          el: ".slider-pagination",
          clickable: true,
          renderBullet,
        }}
        onSwiper={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
          updateBullets(swiper);
        }}
        onSlideChange={handleSlideChange}
        onBreakpoint={(point) => setBreakpoint(point.currentBreakpoint)}
        style={{ overflow: "visible" }}
        breakpoints={{
          768: {
            slidesPerView: 2,
            slidesOffsetAfter: 0,
            spaceBetween: 5,
          },
          1024: {
            slidesPerView: 1,
            slidesOffsetAfter: 200,
          },
          1300: {
            slidesPerView: 2,
            slidesOffsetAfter: 30,
          },
        }}
        centerInsufficientSlides={true}
      >
        {serviceCardData.map((card, index) => (
          <SwiperSlide key={card.title}>
            <div
              className={`
                transition-all duration-500 ease-in-out
                ${index < activeIndex && "scale-0 opacity-0"}
                ${index === activeIndex && "scale-100 z-10"}
                ${index > activeIndex && "scale-100 opacity-100"}
              `}
              style={{ transformOrigin: "center" }}
            >
              <MemoizedServiceCard active={activeIndex === index} {...card} />
            </div>
          </SwiperSlide>
        ))}

        {/* Avoid unnecessary empty slide */}
        {(breakpoint === "768" || breakpoint === "1300") && (
          <SwiperSlide></SwiperSlide>
        )}
      </Swiper>

      {/* Bullet styles */}
      <style jsx global>{`
        .custom-bullet {
          transform-origin: center;
          transform: scaleY(0.6);
        }
        .custom-bullet:hover {
          transform: scaleY(1);
        }
        .custom-bullet.active {
          transform: scale(1.1);
          background: white;
        }
        .custom-bullet.neighbor {
          transform: scaleY(0.8);
        }
      `}</style>
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
      "Mobile & Cross-platform (Flutter)",
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
      "Data-driven go-to-market for SaaS and AI—clear positioning, smart pricing, and repeatable growth loops from ICP to post-launch analytics.",
    services: [
      "ICP & Segmentation",
      "Positioning, Narrative & Messaging",
      "Pricing & Packaging",
      "Demand Gen & Content Engine",
    ],
    tools: [
      "HubSpot",
      "Salesforce",
      "Google Analytics",
      "Mixpanel",
      "Intercom",
      "Zapier",
    ],
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
