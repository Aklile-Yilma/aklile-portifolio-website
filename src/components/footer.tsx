import Link from "next/link";
import { Briefcase, Code2, ExternalLink, MessageCircle } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { siteConfig, whatsappHref } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-12 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
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
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-text-primary"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
          {siteConfig.github ? (
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-text-primary"
            >
              <Code2 className="h-3.5 w-3.5" />
              GitHub
            </a>
          ) : null}
          <a
            href={siteConfig.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-text-primary"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            LinkedIn
          </a>
          <a
            href={siteConfig.upwork}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-text-primary"
          >
            <Briefcase className="h-3.5 w-3.5" />
            Upwork
          </a>
        </nav>
        <p className="text-xs text-text-tertiary">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
