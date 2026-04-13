import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [{ pathname: "/portfolio/**" }],
  },
};

export default nextConfig;
