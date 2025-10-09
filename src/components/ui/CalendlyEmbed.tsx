"use client";

import { useEffect } from "react";

const CalendlyEmbed = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className="calendly-inline-widget mt-10"
      data-url="https://calendly.com/antimatterai/website-intro-call"
      style={{ minWidth: "320px", height: "700px" }}
    ></div>
  );
};

export default CalendlyEmbed;

