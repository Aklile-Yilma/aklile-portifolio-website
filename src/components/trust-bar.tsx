import Image from "next/image";

import { clientLogoSrc, clients } from "@/lib/content";

import { Reveal } from "./reveal";

type TrustBarProps = {
  /**
   * Sits inside the hero: tighter vertical rhythm so stats + logos + scroll fit
   * in the first screen with the headline.
   */
  embedded?: boolean;
};

export function TrustBar({ embedded = false }: TrustBarProps) {
  const doubled = [...clients, ...clients];

  const inner = (
    <>
      <p
        className={
          embedded
            ? "mt-2 mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary md:mt-3 md:mb-4 md:text-[11px]"
            : "mt-2 mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-text-tertiary md:mt-3"
        }
      >
        Trusted by product teams · Direct clients &amp; long-term partners
      </p>
      <div className="relative overflow-hidden mask-[linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
        <div
          className={
            embedded
              ? "animate-marquee flex w-max items-center gap-12 pr-12 md:gap-16 md:pr-16"
              : "animate-marquee flex w-max items-center gap-14 pr-14 md:gap-20 md:pr-20"
          }
        >
          {doubled.map((c, i) => (
            <a
              key={`${c.name}-${i}`}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              title={c.description}
              className="group relative flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-100 md:gap-3"
            >
              <span
                className={
                  embedded
                    ? "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.1] bg-bg-elevated md:h-10 md:w-10"
                    : "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.1] bg-bg-elevated md:h-11 md:w-11"
                }
              >
                <Image
                  src={clientLogoSrc(c)}
                  alt=""
                  width={44}
                  height={44}
                  className={
                    embedded
                      ? "object-contain p-1.5 opacity-90 transition-transform duration-300 group-hover:scale-105"
                      : "object-contain p-1.5 opacity-90 transition-transform duration-300 group-hover:scale-105"
                  }
                  unoptimized={clientLogoSrc(c).startsWith("http")}
                />
              </span>
              <span
                className={
                  embedded
                    ? "font-display whitespace-nowrap text-lg font-medium text-text-secondary/90 transition-colors duration-300 group-hover:text-text-primary md:text-xl"
                    : "font-display whitespace-nowrap text-lg font-medium text-text-secondary/90 transition-colors duration-300 group-hover:text-text-primary md:text-xl"
                }
              >
                {c.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="mt-4 w-full md:mt-5">
        <Reveal className="mx-auto w-full max-w-6xl px-0">{inner}</Reveal>
      </div>
    );
  }

  return (
    <section className="border-y border-white/[0.07] bg-bg-secondary py-10">
      <Reveal className="mx-auto max-w-6xl px-4 md:px-6">{inner}</Reveal>
    </section>
  );
}
