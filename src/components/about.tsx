import { Briefcase, Code2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";

export function About() {
  return (
    <section id="about" className="px-4 py-24 md:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div>
            <SectionHeader
              kicker="About"
              title="AI-native engineer, partner mindset"
              description={
                <>
                  <p className="leading-relaxed">
                    I&apos;m {siteConfig.name}, an{" "}
                    {siteConfig.title.toLowerCase()}. I work with startups and
                    established teams to ship web apps, mobile products, AI-assisted
                    features, and the APIs and infrastructure behind them —
                    including direct engagements alongside marketplace work.
                  </p>
                  <p className="mt-4 leading-relaxed">
                    You get direct access to me — no agency handoffs — with
                    weekly visibility, pragmatic architecture, and honest
                    timelines.
                  </p>
                  <p className="mt-4 leading-relaxed">
                    Working AI-native means I lean on LLMs, RAG, MCP-connected tools,
                    and evals so one engagement can cover frontend, backend, product
                    iteration, and shipping ops without handoff overhead.
                  </p>
                </>
              }
            />
            <Reveal delay={0.06}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={siteConfig.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] px-4 py-2 text-sm text-text-primary transition-colors hover:border-accent/25 hover:bg-white/[0.04]"
                >
                  <ExternalLink className="h-4 w-4 text-accent" />
                  LinkedIn
                </Link>
                {siteConfig.github ? (
                  <Link
                    href={siteConfig.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] px-4 py-2 text-sm text-text-primary transition-colors hover:border-accent/25 hover:bg-white/[0.04]"
                  >
                    <Code2 className="h-4 w-4 text-accent" />
                    GitHub
                  </Link>
                ) : null}
                <Link
                  href={siteConfig.upwork}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] px-4 py-2 text-sm text-text-primary transition-colors hover:border-accent/25 hover:bg-white/[0.04]"
                >
                  <Briefcase className="h-4 w-4" />
                  Upwork
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="space-y-5">
              <div className="relative aspect-square min-h-[18rem] overflow-hidden rounded-2xl border border-white/[0.12] bg-bg-secondary/50 shadow-[0_0_44px_-12px_var(--accent-glow)]">
                <Image
                  src="/photos/personal_profile_picture.jpeg"
                  alt="Portrait of Aklile Yilma"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="glass rounded-2xl p-8 md:p-10">
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  Availability
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  Reach out for a short call to see if we&apos;re a fit — no obligation.
                </p>
                <Link
                  href="#contact"
                  className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-[oklch(0.14_0.04_75)] transition-colors hover:bg-accent-hover"
                >
                  Schedule a call
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
