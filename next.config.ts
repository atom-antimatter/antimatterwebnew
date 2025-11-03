import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    qualities: [25, 50, 75, 100],
  },
  // experimental: {
  //   scrollRestoration: true,
  //   viewTransition: true,
  // },
};

export default withPayload(nextConfig);
