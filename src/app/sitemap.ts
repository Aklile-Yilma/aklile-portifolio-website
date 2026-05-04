import type { MetadataRoute } from "next";

import { siteBaseUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteBaseUrl();

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
