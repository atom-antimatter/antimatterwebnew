"use client";

import React from "react";

const ScrollToSection = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  function handleScrollToSection() {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
  return <div onClick={handleScrollToSection}>{children}</div>;
};

export default ScrollToSection;
