import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Allow all image domains (for development)
    // In production, you should specify exact domains
    unoptimized: true,
  },
};

export default nextConfig;
