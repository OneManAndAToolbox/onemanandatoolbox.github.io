import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/OneManAndAToolbox',
  assetPrefix: '/OneManAndAToolbox',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
