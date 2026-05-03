"use client";

import type { ReactNode } from "react";

import { Reveal } from "./reveal";

type SectionHeaderProps = {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  /** Center kicker, title, and description (e.g. skills section). */
  centered?: boolean;
};

export function SectionHeader({
  kicker,
  title,
  description,
  className,
  centered,
}: SectionHeaderProps) {
  const cx = centered ? "text-center" : "";
  const block = centered ? "mx-auto" : "";

  return (
    <Reveal className={`${cx} ${className ?? ""}`.trim()}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
        {kicker}
      </p>
      <h2
        className={`font-display mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-text-primary md:text-4xl md:leading-tight ${block}`}
      >
        {title}
      </h2>
      {description ? (
        <div
          className={`mt-4 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg ${block}`}
        >
          {description}
        </div>
      ) : null}
    </Reveal>
  );
}
