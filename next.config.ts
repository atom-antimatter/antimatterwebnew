import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  images: {
    qualities: [25, 50, 75, 100],
  },
  // Do NOT add cesium to transpilePackages — the package is ~30 MB of JS and
  // running it through webpack's transpilation pipeline OOMs the 8 GB Vercel
  // build machine.  Cesium ships a pre-built ESM bundle that Next.js can
  // import directly.  Resium is a small wrapper and is fine to transpile.
  transpilePackages: ["resium"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Cesium uses browser-only globals (window, document, WebGL).
      // Never bundle it for the server; the component is loaded client-side
      // only via dynamic import with { ssr: false }.
      const prev = config.externals;
      config.externals = Array.isArray(prev)
        ? [...prev, "cesium"]
        : prev
        ? [prev, "cesium"]
        : ["cesium"];
    }
    return config;
  },
};

export default withPayload(nextConfig);
