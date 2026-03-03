import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  images: {
    qualities: [25, 50, 75, 100],
  },
  // Allow Next.js to process the cesium and resium ESM packages
  transpilePackages: ["cesium", "resium"],
};

export default withPayload(nextConfig);
