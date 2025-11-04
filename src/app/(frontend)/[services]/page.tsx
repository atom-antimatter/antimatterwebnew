import ServiceComponent from "./ServiceComponent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "End-to-end services: AI development, web platforms, secure infrastructure, and design.",
};

const DesignAgencyPage = () => {
  return (
    <div className="pt-40 lg:pt-54 xl:pt-72">
      <ServiceComponent />
    </div>
  );
};

export default DesignAgencyPage;
