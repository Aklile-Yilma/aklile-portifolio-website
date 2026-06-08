/** Organizations you have shipped for — used in the trust marquee. */
export type ClientBrand = {
  name: string;
  href: string;
  description: string;
  /** Optional `/public` path (e.g. `/logos/foo.ico`) — overrides favicon lookup. */
  logoSrc?: string;
};

export const clients: ClientBrand[] = [
  // {
  //   name: "Sellify",
  //   href: "https://www.sellify.app/",
  //   description: "Built mobile seller insights workflows and production-facing integrations.",
  // },
  {
    name: "MookoobMedia",
    href: "https://mookoobmedia.com/",
    description: "Shipped product UX and scalable frontend architecture for client delivery.",
  },
  {
    name: "Dowell Research",
    href: "https://dowellresearch.uk/",
    description: "Supported product engineering and delivery across data-driven initiatives.",
    logoSrc: "/logos/dowell.ico",
  },
  {
    name: "Eskalate",
    href: "https://eskalate.io/",
    description: "Contributed to modern product experiences with clear execution and handoff.",
  },
  {
    name: "Hire Armada",
    href: "https://www.linkedin.com/company/hirearmada/",
    description: "Delivered platform features and polished interfaces for recruitment workflows.",
    logoSrc: "/logos/hire-armada.jpg",
  },
  {
    name: "A2SV",
    href: "https://a2sv.org/",
    description: "Built AI-focused features and cross-functional product experiences at scale.",
  },
];

export function clientFaviconSrc(href: string): string {
  const host = new URL(href).hostname.replace(/^www\./, "");
  return `https://icons.duckduckgo.com/ip3/${host}.ico`;
}

export function clientLogoSrc(client: ClientBrand): string {
  return client.logoSrc ?? clientFaviconSrc(client.href);
}

const DEVICON =
  "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons" as const;

/** Floating dev icons around the hero headline (orbit layout inspired by eskalate.io). */
export type HeroOrbitSkill = { label: string; src: string };

export const heroOrbitSkills: readonly HeroOrbitSkill[] = [
  { label: "JavaScript", src: `${DEVICON}/javascript/javascript-original.svg` },
  { label: "TypeScript", src: `${DEVICON}/typescript/typescript-original.svg` },
  { label: "Python", src: `${DEVICON}/python/python-original.svg` },
  { label: "Node.js", src: `${DEVICON}/nodejs/nodejs-original.svg` },
  { label: "Go", src: `${DEVICON}/go/go-original.svg` },
  { label: "Rust", src: `${DEVICON}/rust/rust-plain.svg` },
  { label: "Django", src: `${DEVICON}/django/django-plain.svg` },
  { label: "React", src: `${DEVICON}/react/react-original.svg` },
  { label: "React Native", src: `${DEVICON}/reactnative/reactnative-original.svg` },
  { label: "Expo", src: `${DEVICON}/expo/expo-original.svg` },
  { label: "Flutter", src: `${DEVICON}/flutter/flutter-original.svg` },
  { label: "Next.js", src: `${DEVICON}/nextjs/nextjs-original.svg` },
  { label: "NestJS", src: `${DEVICON}/nestjs/nestjs-original.svg` },
  { label: "GraphQL", src: `${DEVICON}/graphql/graphql-plain.svg` },
  { label: "PostgreSQL", src: `${DEVICON}/postgresql/postgresql-original.svg` },
  { label: "Redis", src: `${DEVICON}/redis/redis-original.svg` },
  { label: "MongoDB", src: `${DEVICON}/mongodb/mongodb-original.svg` },
  { label: "Prisma", src: `${DEVICON}/prisma/prisma-original.svg` },
  { label: "Kubernetes", src: `${DEVICON}/kubernetes/kubernetes-plain.svg` },
  { label: "Terraform", src: `${DEVICON}/terraform/terraform-original.svg` },
  { label: "AWS", src: `${DEVICON}/amazonwebservices/amazonwebservices-original-wordmark.svg` },
  { label: "FastAPI", src: `${DEVICON}/fastapi/fastapi-original.svg` },
  { label: "Docker", src: `${DEVICON}/docker/docker-original.svg` },
];

/** Shown in a horizontal strip (like a tech stack ticker on the landing page). */
export const skillStackPills = [
  "TypeScript",
  "Next.js",
  "React",
  "NestJS",
  "PostgreSQL",
  "Redis",
  "Docker",
  "Tailwind CSS",
  "React Native",
  "MapLibre",
  "Stripe",
  "Firebase",
  "OpenAI API",
  "LangChain",
  "REST & GraphQL",
  "GitHub Actions",
] as const;

/** Icon-led capability tiles — inspired by clear stack storytelling on modern dev sites. */
export const skillCards = [
  {
    title: "Next.js & React",
    description:
      "App Router, server components where they help, and client UX that stays fast.",
    icon: "layers" as const,
  },
  {
    title: "TypeScript everywhere",
    description: "Shared types across web, API, and tooling — fewer surprises in prod.",
    icon: "braces" as const,
  },
  {
    title: "APIs & NestJS",
    description: "Modular backends, auth, queues, and integrations you can extend.",
    icon: "server" as const,
  },
  {
    title: "Data & Postgres",
    description: "Schema design, migrations, and queries tuned for real workloads.",
    icon: "database" as const,
  },
  {
    title: "React Native",
    description: "Cross-platform apps with native modules when the product needs them.",
    icon: "smartphone" as const,
  },
  {
    title: "Cloud & delivery",
    description: "Dockerized services, CI/CD habits, and sensible cloud defaults.",
    icon: "cloud" as const,
  },
  {
    title: "AI & LLM features",
    description:
      "RAG, MCP-aware tool use, evals, streaming UX, and guardrails — shipped to production.",
    icon: "sparkles" as const,
  },
  {
    title: "Maps & realtime",
    description: "MapLibre, geospatial APIs, and live dashboards that stay responsive.",
    icon: "map" as const,
  },
] as const;

export const stats = [
  { value: 20, suffix: "+", label: "Projects shipped", kind: "number" as const },
  { value: 5, suffix: "", label: "Client rating", kind: "rating" as const },
  { value: 6, suffix: "+", label: "Years experience", kind: "number" as const },
] as const;

export const services = [
  {
    title: "SaaS & web applications",
    description:
      "Full-cycle product work from MVP to scale — Next.js, React, NestJS, and APIs that stay maintainable.",
    icon: "layout" as const,
  },
  {
    title: "Backend & infrastructure",
    description:
      "Distributed systems, Docker, queues, and data pipelines built for reliability and measurable throughput.",
    icon: "server" as const,
  },
  {
    title: "Mobile applications",
    description:
      "Cross-platform React Native apps shipped to real users with auth, device features, and solid UX.",
    icon: "smartphone" as const,
  },
  {
    title: "AI-native product engineering",
    description:
      "LLM features, RAG, evals, and MCP-enabled workflows that make AI useful in production.",
    icon: "sparkles" as const,
  },
  {
    title: "AI workflow automation",
    description:
      "Agentic automations and tool-calling pipelines: docs, alerts, ops tooling, and human-in-the-loop flows.",
    icon: "bot" as const,
  },
];

export const testimonials = [
  {
    quote:
      "I was extremely satisfied with the collaboration with Aklile. The developer perfectly understood my needs and was able to translate them into concrete and effective solutions. Communication was smooth and the work was delivered on time.",
    name: "Mikias V.",
    company: "MookoobMedia, Belgium",
    rating: 5,
  },
  {
    quote:
      "He was incredibly patient and took the time to break down JavaScript concepts in a way that made complex logic much easier to understand — guiding step by step instead of just giving answers.",
    name: "Van",
    company: "Mentoring client",
    rating: 5,
  },
  // {
  //   quote:
  //     "An exceptionally skilled developer who consistently delivers clean, efficient, and reliable solutions beyond expectations.",
  //   name: "Samiksha B.",
  //   company: "Product, Sellify · United States",
  //   rating: 5,
  // },
];

export const processSteps = [
  {
    n: "01",
    title: "Discovery call",
    body: "Understand goals, timeline, and constraints — 15 minutes, no pressure.",
  },
  {
    n: "02",
    title: "Architecture & plan",
    body: "Clear scope, technical approach, and milestones before writing production code.",
  },
  {
    n: "03",
    title: "Build & ship",
    body: "Iterative delivery with demos, code you can own, and deployment support.",
  },
  {
    n: "04",
    title: "Support & iteration",
    body: "Hardening, performance, and features as you grow.",
  },
];
