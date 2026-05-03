"use client";

import dynamic from "next/dynamic";
import { Calendar, ExternalLink, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

import { mailtoHref, siteConfig, whatsappHref } from "@/lib/site-config";

import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";

const Cal = dynamic(() => import("@calcom/embed-react"), { ssr: false });

export function BookCall() {
  const hasCal = Boolean(siteConfig.calLink && siteConfig.calLink !== "demo");

  return (
    <section
      id="contact"
      className="border-t border-white/[0.07] bg-bg-secondary px-4 py-24 md:px-6 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="Next step"
          title="Book a discovery call or message me"
          description="Pick a time that works, or reach out on WhatsApp or email — I typically reply within one business day."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-5 lg:gap-10">
          <Reveal className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-primary">
              {hasCal ? (
                <div className="min-h-[600px] w-full">
                  <Cal calLink={siteConfig.calLink} style={{ width: "100%", height: "100%", minHeight: 600 }} />
                </div>
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
                  <Calendar className="h-12 w-12 text-accent/60" />
                  <p className="max-w-md text-text-secondary">
                    Add{" "}
                    <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-text-primary">
                      NEXT_PUBLIC_CAL_LINK
                    </code>{" "}
                    to your environment to embed your Cal.com scheduling page.
                  </p>
                  <Link
                    href={mailtoHref()}
                    className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-[oklch(0.14_0.04_75)] hover:bg-accent-hover"
                  >
                    Email to book instead
                  </Link>
                </div>
              )}
            </div>
          </Reveal>

          <div className="flex flex-col gap-4 lg:col-span-2">
            <Reveal delay={0.05}>
              <Link
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="glass flex items-center gap-4 rounded-2xl p-5 transition-colors hover:border-white/20"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <MessageCircle className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-medium text-text-primary">WhatsApp</p>
                  <p className="text-sm text-text-tertiary">Fastest for short questions</p>
                </div>
              </Link>
            </Reveal>
            <Reveal delay={0.1}>
              <Link
                href={mailtoHref()}
                className="glass flex items-center gap-4 rounded-2xl p-5 transition-colors hover:border-white/20"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Mail className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-medium text-text-primary">Email</p>
                  <p className="text-sm text-text-tertiary">{siteConfig.email}</p>
                </div>
              </Link>
            </Reveal>
            <Reveal delay={0.15}>
              <Link
                href={siteConfig.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="glass flex items-center gap-4 rounded-2xl p-5 transition-colors hover:border-white/20"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <ExternalLink className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-medium text-text-primary">LinkedIn</p>
                  <p className="text-sm text-text-tertiary">Connect professionally</p>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
