import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export default function NotFound() {
  return (
    <div className="mesh-bg flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="font-display mt-3 max-w-md text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-4 max-w-sm text-text-secondary">
        If you followed a link, it may be outdated. Head back to the main site.
      </p>
      <Link
        href="/"
        className="mt-10 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[oklch(0.14_0.04_75)] transition-colors hover:bg-accent-hover"
      >
        Back to {siteConfig.name.split(" ")[0]}&apos;s site
      </Link>
    </div>
  );
}
