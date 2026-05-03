import { processSteps } from "@/lib/content";

import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";

export function Process() {
  return (
    <section
      id="process"
      className="border-y border-white/[0.07] bg-bg-secondary px-4 py-24 md:px-6 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="How we work"
          title="A simple process — no surprises"
        />

        <ol className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.06}>
              <li className="relative">
                <span className="font-display text-4xl font-bold text-accent/[0.12]">
                  {step.n}
                </span>
                <h3 className="font-display mt-2 text-lg font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {step.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
