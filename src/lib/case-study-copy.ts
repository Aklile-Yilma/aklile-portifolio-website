/** Narrative + tags for featured work (slug matches public/portfolio folder). */
export type CaseStudyCopy = {
  /** Live product, org site, or in-page anchor (e.g. `#contact`). */
  clientUrl: string;
  summary: string;
  role: string;
  approach: string[];
  outcome: string[];
  loomUrl?: string;
  tags: string[];
  /** Short bullets used on homepage cards. */
  bullets: string[];
  testimonial?: { quote: string; name: string; company: string };
};

export const CASE_STUDY_COPY: Record<string, CaseStudyCopy> = {
  aladia: {
    clientUrl: "https://aladia.io/",
    summary:
      "Integrated e-learning ecosystem connecting expert instructors with professional learners through a scalable, product-led SaaS experience.",
    role: "Senior Fullstack Developer",
    approach: [
      "Led end-to-end platform engineering across frontend and backend, shaping the architecture for a multi-role learning marketplace that could scale without slowing product velocity.",
      "Built core learning workflows including on-demand course delivery, real-time chat, and interactive calendar scheduling to support both instructor and learner daily operations.",
      "Designed high-conversion instructor profile and discovery experiences, then connected them to actionable monetization tooling with a financial dashboard for live income and spending visibility.",
    ],
    outcome: [
      "Delivered a production-ready e-learning SaaS foundation with strong UX and dependable full-stack architecture for long-term growth.",
      "Enabled smoother instructor-to-learner matching and repeat engagement through reliable communication, scheduling, and revenue-tracking flows.",
    ],
    tags: [
      "Elearning",
      "SaaS Development",
      "Vue.js",
      "NestJS",
      "Full-Stack Development",
    ],
    bullets: [
      "Led architecture and implementation as Senior Fullstack Developer for a full-stack e-learning marketplace.",
      "Shipped high-impact core features: on-demand courses, real-time chat, interactive calendars, and rich instructor profiles.",
      "Built monetization visibility tooling with a financial dashboard for live income/spending insights and better business decisions.",
    ],
  },
  "hakim-hub-ai-health-assistant": {
    clientUrl: "https://a2sv.org/",
    summary:
      "AI health assistant focused on trusted guidance, clarity, and mobile-first usability.",
    role: "Delivered core cross-platform experience and data flows in Flutter.",
    approach: [
      "Modeled structured health inputs and guided journeys for clearer decisions.",
      "Built offline-aware mobile interactions with resilient API handling.",
      "Collaborated across teams to align product behavior with real user needs.",
    ],
    outcome: [
      "Delivered trust-first AI assistant experiences for mobile contexts.",
      "Reduced friction in health info capture and retrieval user flows.",
    ],
    tags: ["Flutter", "AI", "Health"],
    bullets: [
      "Health assistant experience with structured medical data and guided user journeys.",
      "Cross-platform Flutter delivery with emphasis on clarity, trust, and offline-aware flows.",
      "Collaboration with Africa-to-Silicon Valley engineers on a high-impact community product.",
    ],
  },
  "sellify-mobile-app-walmart-seller-insights": {
    clientUrl: "https://www.sellify.app/",
    summary:
      "Seller insights mobile app for Walmart workflows with production integrations.",
    role: "Owned React Native feature delivery across auth, device flows, and API integration.",
    approach: [
      "Implemented cross-platform app flows with Firebase auth and backend integration.",
      "Built camera/barcode and seller workflow screens with resilient state handling.",
      "Prioritized release stability and maintainability for ongoing product velocity.",
    ],
    outcome: [
      "Shipped a production-ready app used in day-to-day seller operations.",
      "Improved reliability and iteration speed with cleaner architecture.",
    ],
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
    summary:
      "Full-stack geospatial product for seller planning with fast map interactions at scale.",
    role: "Built web and API layers for map-heavy workflows and paid access controls.",
    approach: [
      "Implemented MapLibre experiences with clustering, search, and dark/light basemaps.",
      "Integrated geocoding and payload optimization for performance at larger datasets.",
      "Connected Stripe-gated tiers for monetization-ready feature access.",
    ],
    outcome: [
      "Shipped performant geospatial UX with clear upgrade paths.",
      "Enabled business-ready mapping workflows with integrated billing.",
    ],
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
    summary:
      "All-in-one growth platform for local businesses with polished UX and maintainable code.",
    role: "Partnered directly with stakeholders and led frontend implementation quality.",
    approach: [
      "Translated business requirements into practical interaction patterns.",
      "Built performance-conscious frontend components for sustained product velocity.",
      "Worked in tight feedback loops from scope through shipped milestones.",
    ],
    outcome: [
      "Delivered a clearer product experience with stronger execution confidence.",
      "Improved maintainability for faster iteration after launch.",
    ],
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
    summary:
      "Opportunity and talent platform connecting people with roles through reliable workflows.",
    role: "Contributed full-stack feature development and integration quality.",
    approach: [
      "Shipped end-to-end features across web UX and backend integrations.",
      "Focused on clear navigation, role discovery, and dependable core interactions.",
      "Balanced rapid delivery with maintainable engineering standards.",
    ],
    outcome: [
      "Improved connection paths between users and opportunities.",
      "Strengthened reliability while sustaining iterative delivery.",
    ],
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
