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
    const script = document.createElement("script");
    script.setAttribute("nowprocket", "");
    script.setAttribute("nitro-exclude", "");
    script.type = "text/javascript";
    script.id = "sa-dynamic-optimization";
    script.setAttribute("data-uuid", "7f9ceae5-e659-43c8-99ee-33b970d2b92d");
    script.src = "data:text/javascript;base64,dmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoInNjcmlwdCIpO3NjcmlwdC5zZXRBdHRyaWJ1dGUoIm5vd3Byb2NrZXQiLCAiIik7c2NyaXB0LnNldEF0dHJpYnV0ZSgibml0cm8tZXhjbHVkZSIsICIiKTtzY3JpcHQuc3JjID0gImh0dHBzOi8vZGFzaGJvYXJkLnNlYXJjaGF0bGFzLmNvbS9zY3JpcHRzL2R5bmFtaWNfb3B0aW1pemF0aW9uLmpzIjtzY3JpcHQuZGF0YXNldC51dWlkID0gIjdmOWNlYWU1LWU2NTktNDNjOC05OWVlLTMzYjk3MGQyYjkyZCI7c2NyaXB0LmlkID0gInNhLWR5bmFtaWMtb3B0aW1pemF0aW9uLWxvYWRlciI7ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpOw==";
    
    // Append to head immediately to ensure it loads as early as possible
    document.head.appendChild(script);
    
    // Verify script was added
    if (document.getElementById("sa-dynamic-optimization")) {
      console.log("OTTO Pixel script injected successfully");
    } else {
      console.error("OTTO Pixel script failed to inject");
    }
  }, [pathname]);

  return null;
}

