import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, MessageCircle } from "lucide-react";

import { getCaseStudyBySlug, getFeaturedCaseStudies } from "@/lib/case-studies";
import { WorkGallery } from "@/components/work-gallery";
import { mailtoHref, whatsappHref } from "@/lib/site-config";

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getFeaturedCaseStudies().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);
  if (!caseStudy) {
    return {
      title: "Work",
    };
  }

  return {
    title: `${caseStudy.title} · Work`,
    description: caseStudy.summary,
  };
}

export default async function WorkDetailPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);
  if (!caseStudy) notFound();

  return (
    <main className="px-4 pb-20 pt-28 md:px-6 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-text-secondary transition-colors hover:text-accent">
          ← Back to selected work
        </Link>

        <header className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h1 className="font-display text-3xl font-semibold text-text-primary md:text-4xl">
              {caseStudy.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-secondary md:text-lg">
              {caseStudy.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {caseStudy.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <a
            href={caseStudy.clientUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-accent/30 hover:text-accent"
          >
            Visit live project
            <ExternalLink className="h-4 w-4" />
          </a>
        </header>

        {caseStudy.loomUrl ? (
          <section className="mt-10">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-bg-secondary">
              <iframe
                src={caseStudy.loomUrl}
                className="h-[420px] w-full md:h-[520px]"
                allowFullScreen
                title={`${caseStudy.title} walkthrough`}
              />
            </div>
          </section>
        ) : null}

        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_19rem] lg:items-start">
          <div className="space-y-8">
            <article className="glass rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-xl font-semibold text-text-primary">My role</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary md:text-base">
                {caseStudy.role}
              </p>
            </article>

            <article className="glass rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-xl font-semibold text-text-primary">Approach</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                {caseStudy.approach.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed md:text-base">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>

            <article className="glass rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-xl font-semibold text-text-primary">Outcome</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                {caseStudy.outcome.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed md:text-base">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>

            <WorkGallery title={caseStudy.title} images={caseStudy.gallery} slug={caseStudy.slug} />
          </div>

          <aside className="glass top-24 rounded-2xl p-5 lg:sticky">
            <h3 className="font-display text-base font-semibold text-text-primary">Start your project</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Need similar execution quality? Let&apos;s map your first milestone.
            </p>
            <div className="mt-4 space-y-2">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-[oklch(0.14_0.04_75)] transition-colors hover:bg-accent-hover"
              >
                Book a discovery call
              </Link>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.12] px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-accent/30"
              >
                <MessageCircle className="h-4 w-4 text-accent" />
                WhatsApp
              </a>
              <a
                href={mailtoHref()}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/[0.12] px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-accent/30"
              >
                Email
              </a>
            </div>
            {caseStudy.testimonial ? (
              <blockquote className="mt-5 border-l-2 border-accent/60 pl-4">
                <p className="text-sm italic text-text-secondary">
                  &ldquo;{caseStudy.testimonial.quote}&rdquo;
                </p>
                <footer className="mt-2 text-xs text-text-tertiary">
                  — {caseStudy.testimonial.name}, {caseStudy.testimonial.company}
                </footer>
              </blockquote>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  );
}

