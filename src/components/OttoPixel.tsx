"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function OttoPixel() {
  const pathname = usePathname();

  useEffect(() => {
    // Only load on non-admin pages
    if (pathname && pathname.startsWith("/admin")) {
      return;
    }

    // Check if script already exists
    if (document.getElementById("sa-dynamic-optimization")) {
      return;
    }

    // Create and inject the Otto pixel script with exact attributes as required
    // This matches the exact format from SearchAtlas installation guide
    // The script creates another script that loads the actual OTTO pixel
    const script = document.createElement("script");
    script.setAttribute("nowprocket", "");
    script.setAttribute("nitro-exclude", "");
    script.type = "text/javascript";
    script.id = "sa-dynamic-optimization";
    script.setAttribute("data-uuid", "7f9ceae5-e659-43c8-99ee-33b970d2b92d");
    script.src = "data:text/javascript;base64,dmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoInNjcmlwdCIpO3NjcmlwdC5zZXRBdHRyaWJ1dGUoIm5vd3Byb2NrZXQiLCAiIik7c2NyaXB0LnNldEF0dHJpYnV0ZSgibml0cm8tZXhjbHVkZSIsICIiKTtzY3JpcHQuc3JjID0gImh0dHBzOi8vZGFzaGJvYXJkLnNlYXJjaGF0bGFzLmNvbS9zY3JpcHRzL2R5bmFtaWNfb3B0aW1pemF0aW9uLmpzIjtzY3JpcHQuZGF0YXNldC51dWlkID0gIjdmOWNlYWU1LWU2NTktNDNjOC05OWVlLTMzYjk3MGQyYjkyZCI7c2NyaXB0LmlkID0gInNhLWR5bmFtaWMtb3B0aW1pemF0aW9uLWxvYWRlciI7ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpOw==";
    
    // Append to head immediately to ensure it loads as early as possible
    // This needs to be in the head for SearchAtlas to detect it
    if (document.head) {
      document.head.appendChild(script);
    } else {
      // If head isn't ready, wait for it
      const observer = new MutationObserver(() => {
        if (document.head && !document.getElementById("sa-dynamic-optimization")) {
          document.head.appendChild(script);
          observer.disconnect();
        }
      });
      observer.observe(document.documentElement, { childList: true });
    }
  }, [pathname]);

  return null;
}

