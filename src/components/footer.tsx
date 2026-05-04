import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { siteConfig, whatsappHref } from "@/lib/site-config";

export function Footer() {
  const socialIconClass = "h-4 w-4";

  return (
    <footer className="border-t border-white/10 px-4 py-12 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <BrandMark className="h-10 w-10 shrink-0" />
            <div>
              <p className="font-display text-lg font-semibold text-text-primary">
                {siteConfig.name}
              </p>
              <p className="mt-0.5 text-sm text-text-tertiary">{siteConfig.title}</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-text-secondary">
            <Link href="#work" className="hover:text-text-primary">
              Work
            </Link>
            <Link href="#skills" className="hover:text-text-primary">
              Skills
            </Link>
            <Link href="#services" className="hover:text-text-primary">
              Services
            </Link>
            <Link href="#contact" className="hover:text-text-primary">
              Contact
            </Link>
          </nav>
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <nav className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 hover:border-white/25 hover:text-text-primary"
            >
              <img
                src="https://cdn.simpleicons.org/whatsapp/25D366"
                alt=""
                aria-hidden
                className={socialIconClass}
              />
              WhatsApp
            </a>
            {siteConfig.github ? (
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 hover:border-white/25 hover:text-text-primary"
              >
                <img
                  src="https://cdn.simpleicons.org/github"
                  alt=""
                  aria-hidden
                  className={socialIconClass}
                />
                GitHub
              </a>
            ) : null}
            <a
              href={siteConfig.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 hover:border-white/25 hover:text-text-primary"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className={socialIconClass}
                fill="#0A66C2"
              >
                <path d="M20.447 20.452h-3.554V14.87c0-1.331-.027-3.044-1.854-3.044-1.853 0-2.136 1.445-2.136 2.948v5.678H9.349V9h3.414v1.561h.046c.477-.9 1.637-1.849 3.37-1.849 3.601 0 4.267 2.37 4.267 5.455v6.285zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 01-.001 4.124zM7.119 20.452H3.555V9h3.564v11.452z" />
              </svg>
              LinkedIn
            </a>
            <a
              href={siteConfig.upwork}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 hover:border-white/25 hover:text-text-primary"
            >
              <img
                src="https://cdn.simpleicons.org/upwork/6FDA44"
                alt=""
                aria-hidden
                className={socialIconClass}
              />
              Upwork
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
