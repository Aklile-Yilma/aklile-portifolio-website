import { Quote } from "lucide-react";

import { testimonials } from "@/lib/content";

import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";

export function Testimonials() {
  return (
    <section className="px-4 py-24 md:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="Client feedback"
          title="What people say after we ship"
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06}>
              <figure className="glass flex h-full flex-col rounded-2xl p-6 md:p-8">
                <Quote
                  className="h-8 w-8 text-accent/40"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-text-secondary md:text-base">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-white/[0.08] pt-4">
                  <p className="font-medium text-text-primary">{t.name}</p>
                  <p className="mt-0.5 text-sm text-text-tertiary">{t.company}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
