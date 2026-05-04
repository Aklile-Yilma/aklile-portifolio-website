import type { MetadataRoute } from "next";

import { siteBaseUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = siteBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/stats", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
