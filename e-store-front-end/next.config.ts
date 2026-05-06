import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** Directory containing this config (e-store-front-end), not a parent workspace folder. */
const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Use this app as Turbopack root so deps resolve from e-store-front-end/node_modules
  // (avoids wrong root from /home/dev/package-lock.json or monorepo paths).
  turbopack: {
    root: appDir,
    resolveAlias: {
      tailwindcss: path.join(appDir, "node_modules", "tailwindcss"),
    },
  },
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
