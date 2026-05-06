"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { CaseStudy } from "@/lib/case-studies";

import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";

function isHashOnly(href: string) {
  return href.startsWith("#");
}

export function CaseStudies({ cases }: { cases: CaseStudy[] }) {
  return (
    <section id="work" className="bg-bg-secondary px-4 py-24 md:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="Selected work"
          title="Case studies from real client engagements"
          description="Production systems shipped for product teams and direct clients — each card links to the organization, repo, or a way to reach me."
        />

        <div className="mt-14 flex flex-col gap-16">
          {cases.map((c, index) => {
            const internal = isHashOnly(c.clientUrl);
            const badge = internal ? "Get in touch" : "Visit live site";

            const media = (
              <div className="grid h-full grid-cols-3 gap-2 p-2">
                <div className="relative col-span-2 row-span-3 overflow-hidden rounded-xl">
                  <Image
                    src={c.coverImage}
                    alt={`${c.title} cover`}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    priority={index === 0}
                  />
                </div>
                {c.gallery.slice(1, 4).map((image, imageIndex) => (
                  <div key={`${c.slug}-gallery-${imageIndex}`} className="relative overflow-hidden rounded-xl">
                    <Image
                      src={image}
                      alt={`${c.title} preview ${imageIndex + 1}`}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 33vw, 16vw"
                    />
                  </div>
                ))}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-bg-primary/70 via-transparent to-transparent opacity-70" />
                <span className="pointer-events-none absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-text-primary backdrop-blur-sm">
                  <ExternalLink className="h-3.5 w-3.5" />
                  {badge}
                </span>
              </div>
            );

            const shellClass =
              "group relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-elevated transition-shadow duration-300 hover:border-accent/20 hover:shadow-[0_0_0_1px_oklch(0.82_0.145_78/0.15)] lg:aspect-[4/3]";

            return (
              <Reveal key={c.slug}>
                <article className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-text-primary md:text-3xl">
                      {c.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-text-secondary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <ul className="mt-6 space-y-3 text-text-secondary">
                      {c.bullets.map((b) => (
                        <li key={b} className="flex gap-3 text-sm leading-relaxed md:text-base">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <Link
                        href={`/work/${c.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                      >
                        View project details
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    {c.testimonial ? (
                      <blockquote className="mt-8 border-l-2 border-accent/60 pl-5">
                        <p className="text-sm italic text-text-secondary md:text-base">
                          &ldquo;{c.testimonial.quote}&rdquo;
                        </p>
                        <footer className="mt-3 text-sm text-text-tertiary">
                          — {c.testimonial.name}, {c.testimonial.company}
                        </footer>
                      </blockquote>
                    ) : null}
                  </div>

                  <Link href={`/work/${c.slug}`} className={shellClass}>
                    {media}
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
