import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Aklile",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0b",
    theme_color: "#f6c455",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
  };
}
