"use client";

import { motion } from "framer-motion";
import { ArrowDown, Calendar, MessageCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { DevOrbit } from "@/components/dev-orbit";
import { trackEvent } from "@/lib/analytics";
import { TrustBar } from "@/components/trust-bar";
import { heroOrbitSkills, stats } from "@/lib/content";
import { mailtoHref, siteConfig, whatsappHref } from "@/lib/site-config";

const easeOut = [0.16, 1, 0.3, 1] as const;

function formatStat(
  value: number,
  suffix: string,
  decimals?: number,
): string {
  if (decimals !== undefined) return `${value.toFixed(decimals)}${suffix}`;
  return `${value}${suffix}`;
}

export function Hero() {
  const { line1, line2 } = siteConfig.heroHeadline;

  return (
    <section
      id="top"
      className="mesh-bg relative flex min-h-dvh flex-col overflow-hidden px-4 pb-8 pt-[5.25rem] md:px-6 md:pb-10 md:pt-28"
    >
      <div className="bg-grid pointer-events-none absolute inset-0 z-0 opacity-[0.65]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 88%, oklch(0.78 0.14 78 / 0.16) 0%, transparent 40%), radial-gradient(circle at 92% 8%, oklch(0.5 0.08 240 / 0.14) 0%, transparent 36%), radial-gradient(circle at 70% 65%, oklch(0.65 0.1 78 / 0.07) 0%, transparent 32%)",
        }}
      />
      <div className="hero-grain absolute inset-0 z-[1]" aria-hidden />

      <div className="relative z-[2] mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="mb-4 flex flex-wrap items-center justify-center gap-2 md:mb-5 md:gap-3"
        >
          <div className="inline-flex items-center rounded-full border border-white/[0.1] bg-[oklch(0.16_0.014_78/0.55)] px-3.5 py-1.5 backdrop-blur-md">
            <span className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_14px_var(--accent-glow)]" />
            <p className="text-xs font-medium tracking-wide text-text-secondary md:text-sm">
              <span className="text-text-primary">Open to remote</span>
              <span className="text-text-tertiary"> · </span>
              <span>US &amp; EU-friendly hours</span>
            </p>
          </div>
          <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
            Available
          </span>
        </motion.div>

        {/* Center block + orbiting devicons (layout inspired by eskalate.io hero). */}
        <div className="relative mx-auto mt-0 min-h-0 w-full max-w-5xl shrink md:mt-1">
          <DevOrbit skills={heroOrbitSkills} />

          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-3 pb-2 pt-6 text-center md:px-5 md:pb-3 md:pt-8">
            <motion.h1
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.04, ease: easeOut }}
              className="font-display pb-[0.15em] text-[clamp(2.1rem,7.5vw,4.25rem)] font-semibold leading-[1.12] tracking-tight md:leading-[1.08]"
            >
              <span className="block text-text-primary">{line1}</span>
              <span className="mt-1 block bg-linear-to-r from-accent via-[oklch(0.88_0.1_72)] to-accent-2 bg-clip-text text-transparent md:mt-2">
                {line2}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: easeOut }}
              className="mt-4 inline-flex items-center gap-2 bg-linear-to-r from-[oklch(0.9_0.09_85)] via-[oklch(0.84_0.12_72)] to-[oklch(0.72_0.13_58)] bg-clip-text text-sm font-semibold text-transparent md:mt-5 md:text-base"
            >
              <span className="relative h-8 w-8 overflow-hidden rounded-full border border-white/15 ring-1 ring-accent/30">
                <Image
                  src="/photos/personal_profile_picture.jpeg"
                  alt="Aklile Yilma"
                  fill
                  className="object-cover object-top"
                  sizes="32px"
                />
              </span>
              Hi, I am Aklile Yilma.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease: easeOut }}
              className="mt-3 max-w-xl text-base leading-relaxed text-text-secondary md:mt-4 md:text-lg md:leading-relaxed"
            >
              I help teams ship SaaS, mobile, backends, and AI automation — from LLM
              features to reliable workflows — with clear communication and owned delivery.
              Six years of production delivery across US, EU, and Africa teams.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: easeOut }}
              className="mt-4 flex w-full max-w-lg flex-col items-center justify-center gap-2.5 sm:flex-row sm:flex-wrap md:mt-5"
            >
              <Link
                href="#contact"
                onClick={() =>
                  trackEvent({
                    name: "cta_book_call_click",
                    location: "hero",
                    href: "#contact",
                  })
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-[oklch(0.14_0.04_75)] shadow-[0_0_44px_-10px_var(--accent-glow)] transition-[transform,background,box-shadow] duration-200 hover:scale-[1.02] hover:bg-accent-hover hover:shadow-[0_0_52px_-8px_var(--accent-glow)] active:scale-[0.99] sm:w-auto"
              >
                <Calendar className="h-5 w-5" />
                Book a discovery call
              </Link>
              <Link
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent({
                    name: "cta_whatsapp_click",
                    location: "hero",
                    href: whatsappHref(),
                  })
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-[oklch(0.14_0.012_75/0.45)] px-6 py-3.5 text-base font-medium text-text-primary backdrop-blur-sm transition-colors duration-200 hover:border-accent/35 hover:bg-[oklch(0.18_0.016_78/0.55)] sm:w-auto"
              >
                <MessageCircle className="h-5 w-5 text-accent" />
                WhatsApp
              </Link>
              <Link
                href={mailtoHref()}
                onClick={() =>
                  trackEvent({
                    name: "cta_email_click",
                    location: "hero",
                    href: mailtoHref(),
                  })
                }
                className="text-sm text-text-secondary underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                Or email directly
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42, duration: 0.65, ease: easeOut }}
          className="mx-auto mt-4 grid max-w-4xl grid-cols-2 justify-items-center gap-3 border-t border-white/[0.07] pt-5 text-center md:mt-5 md:grid-cols-4 md:gap-0 md:divide-x md:divide-white/[0.06] md:pt-6"
        >
          {stats.map((s) => (
            <div key={s.label} className="md:px-4 md:first:pl-0 md:last:pr-0">
              {s.kind === "rating" ? (
                <div className="flex items-center justify-center gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={`${s.label}-${i}`} className="h-4 w-4 fill-current md:h-5 md:w-5" />
                  ))}
                </div>
              ) : (
                <p className="font-display text-lg font-semibold tabular-nums text-text-primary md:text-xl">
                  {formatStat(s.value, s.suffix)}
                </p>
              )}
              <p className="mt-1 text-xs text-text-tertiary md:text-sm">{s.label}</p>
            </div>
          ))}
        </motion.div>

        <TrustBar embedded />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.55 }}
          className="mt-auto flex flex-col items-center gap-1 pb-1 pt-4 text-text-tertiary md:pt-5"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.28em]">
            Scroll
          </span>
          <ArrowDown className="h-4 w-4 animate-pulse-chevron md:h-5 md:w-5" aria-hidden />
        </motion.div>
      </div>
    </section>
  );
}
