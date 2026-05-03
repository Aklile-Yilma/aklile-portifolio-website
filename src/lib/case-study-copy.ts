/** Narrative + tags for featured work (slug matches public/portfolio folder). */
export type CaseStudyCopy = {
  /** Live product, org site, or in-page anchor (e.g. `#contact`). */
  clientUrl: string;
  tags: string[];
  bullets: string[];
  testimonial?: { quote: string; name: string; company: string };
};

export const CASE_STUDY_COPY: Record<string, CaseStudyCopy> = {
  aladia: {
    clientUrl: "https://aladia.io/",
    tags: ["Next.js", "AI UX", "Product"],
    bullets: [
      "Conversational and assistant-style flows with fast, accessible UI and clear guardrails.",
      "Streaming-friendly patterns, optimistic states, and resilient error handling for AI-backed actions.",
      "Built for iteration: feature flags, modular prompts, and metrics hooks for product learning loops.",
    ],
  },
  "hakim-hub-ai-health-assistant": {
    clientUrl: "https://a2sv.org/",
    tags: ["Flutter", "AI", "Health"],
    bullets: [
      "Health assistant experience with structured medical data and guided user journeys.",
      "Cross-platform Flutter delivery with emphasis on clarity, trust, and offline-aware flows.",
      "Collaboration with Africa-to-Silicon Valley engineers on a high-impact community product.",
    ],
  },
  "sellify-mobile-app-walmart-seller-insights": {
    clientUrl: "https://www.sellify.app/",
    tags: ["React Native", "SaaS", "Mobile"],
    bullets: [
      "Cross-platform seller insights app for Walmart-related workflows.",
      "Firebase auth, camera & barcode flows, and resilient API integration.",
      "Shipped for production use with the Sellify team (Sellify LLC).",
    ],
    testimonial: {
      quote:
        "An exceptionally skilled developer who consistently delivers clean, efficient, and reliable solutions beyond expectations.",
      name: "Samiksha B.",
      company: "Product, Sellify · United States",
    },
  },
  "walmart-seller-map": {
    clientUrl: "https://www.sellify.app/",
    tags: ["Next.js", "NestJS", "Maps"],
    bullets: [
      "Full-stack MapLibre experience: clusters, search, light/dark basemaps.",
      "Pelias-backed geocoding, zstd payloads, and Stripe-gated tiers.",
      "Built to stay fast with large marker sets and clear upgrade paths.",
    ],
    testimonial: {
      quote:
        "An exceptionally skilled developer who consistently delivers clean, efficient, and reliable solutions beyond expectations.",
      name: "Samiksha B.",
      company: "Product, Sellify · United States",
    },
  },
  "mookoobmedia-all-in-one-local-business-growth-platform": {
    clientUrl: "https://mookoobmedia.com/",
    tags: ["Next.js", "Product", "Frontend"],
    bullets: [
      "All-in-one growth platform UI for local businesses and creators.",
      "Tight collaboration with stakeholders in Belgium from discovery to delivery.",
      "Performance-minded implementation and maintainable structure.",
    ],
    testimonial: {
      quote:
        "I was extremely satisfied with the collaboration with Aklile. The developer perfectly understood my needs and was able to translate them into concrete and effective solutions.",
      name: "Mikias V.",
      company: "MookoobMedia, Belgium",
    },
  },
  akilconnect: {
    clientUrl: "https://www.akilconnect.org/en",
    tags: ["Full-stack", "Platform"],
    bullets: [
      "Talent-and-opportunity platform: connecting people with the right roles.",
      "End-to-end feature work across web stack and integrations.",
      "Focused on clarity, reliability, and a smooth user journey.",
    ],
  },
};

export const FEATURED_CASE_SLUGS = [
  "aladia",
  "hakim-hub-ai-health-assistant",
  "sellify-mobile-app-walmart-seller-insights",
  "walmart-seller-map",
  "mookoobmedia-all-in-one-local-business-growth-platform",
  "akilconnect",
] as const;
