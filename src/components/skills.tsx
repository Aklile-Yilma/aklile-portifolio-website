import {
  Braces,
  Cloud,
  Database,
  Layers,
  Map,
  Server,
  Smartphone,
  Sparkles,
} from "lucide-react";

import { skillCards, skillStackPills } from "@/lib/content";

import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";

const cardIcons = {
  layers: Layers,
  braces: Braces,
  server: Server,
  database: Database,
  smartphone: Smartphone,
  cloud: Cloud,
  sparkles: Sparkles,
  map: Map,
} as const;

export function Skills() {
  const doubledPills = [...skillStackPills, ...skillStackPills];

  return (
    <section
      id="skills"
      className="border-y border-white/[0.07] bg-bg-secondary px-4 py-24 md:px-6 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            kicker="Stack"
            title="Skills & tooling I ship with"
            description="Stack up front, then deeper services — a practical slice of what I use on real roadmaps for SaaS, mobile, and AI work."
            centered
          />
        </div>

        <Reveal delay={0.06}>
          <p className="mt-10 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-text-tertiary">
            Day-to-day tools &amp; platforms
          </p>
          <div className="relative mt-5 overflow-hidden mask-[linear-gradient(90deg,transparent,black_5%,black_95%,transparent)]">
            <div className="animate-marquee flex w-max gap-3 pr-3 md:gap-4 md:pr-4">
              {doubledPills.map((label, i) => (
                <span
                  key={`${label}-${i}`}
                  className="shrink-0 rounded-full border border-white/[0.1] bg-bg-elevated px-4 py-2 text-sm font-medium text-text-secondary shadow-sm"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skillCards.map((s, i) => {
            const Icon = cardIcons[s.icon];
            return (
              <Reveal key={s.title} delay={0.04 + i * 0.04}>
                <article className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-bg-primary/40 p-5 transition-[border,box-shadow,background] duration-300 hover:border-accent/25 hover:bg-bg-primary/70 hover:shadow-[0_0_0_1px_oklch(0.82_0.145_78/0.12)] md:p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-accent/20 to-accent/5 text-accent ring-1 ring-white/[0.08] transition-transform duration-300 group-hover:scale-[1.03]">
                    <Icon className="h-7 w-7" strokeWidth={1.65} aria-hidden />
                  </div>
                  <h3 className="font-display mt-5 text-lg font-semibold tracking-tight text-text-primary">
                    {s.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                    {s.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
