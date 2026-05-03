import { Bot, LayoutGrid, Server, Smartphone, Sparkles } from "lucide-react";

import { services } from "@/lib/content";

import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";

const icons = {
  layout: LayoutGrid,
  server: Server,
  smartphone: Smartphone,
  sparkles: Sparkles,
  bot: Bot,
} as const;

export function Services() {
  return (
    <section id="services" className="px-4 py-24 md:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="What I deliver"
          title="AI-native full-stack ownership from idea to shipped product"
          description="One engineer who spans frontend, backend, mobile, and AI — so you spend less time coordinating and more time launching."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = icons[s.icon];
            return (
              <Reveal key={s.title} delay={i * 0.06}>
                <article className="glass h-full rounded-2xl p-6 md:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display mt-5 text-xl font-semibold text-text-primary">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
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
