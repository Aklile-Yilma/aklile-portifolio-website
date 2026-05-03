import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: { root: ROOT },
  images: {
    localPatterns: [
      { pathname: "/portfolio/**" },
      { pathname: "/brand/**" },
      { pathname: "/logos/**" },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/devicons/**",
      },
    ],
  },
};

export default nextConfig;
