import Link from "next/link";
import { SiGithub, SiLinkedin, SiUpwork, SiWhatsapp } from "react-icons/si";

import { BrandMark } from "@/components/brand-mark";
import { siteConfig, whatsappHref } from "@/lib/site-config";

export function Footer() {
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
              <SiWhatsapp className="h-4 w-4 text-[#25D366]" aria-hidden />
              WhatsApp
            </a>
            {siteConfig.github ? (
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 hover:border-white/25 hover:text-text-primary"
              >
                <SiGithub className="h-4 w-4" aria-hidden />
                GitHub
              </a>
            ) : null}
            <a
              href={siteConfig.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 hover:border-white/25 hover:text-text-primary"
            >
              <SiLinkedin className="h-4 w-4 text-[#0A66C2]" aria-hidden />
              LinkedIn
            </a>
            <a
              href={siteConfig.upwork}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 hover:border-white/25 hover:text-text-primary"
            >
              <SiUpwork className="h-4 w-4 text-[#6FDA44]" aria-hidden />
              Upwork
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
