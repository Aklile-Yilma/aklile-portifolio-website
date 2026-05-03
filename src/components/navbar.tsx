"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { ReferralModal } from "@/components/referral-modal";

const links = [
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 px-4 pt-4 md:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border border-white/[0.09] bg-[oklch(0.12_0.012_75/0.78)] px-4 py-3 backdrop-blur-xl md:px-6">
        <Link
          href="#top"
          aria-label="Home"
          className="flex items-center rounded-lg text-text-primary outline-offset-4 transition-opacity hover:opacity-90"
        >
          <BrandMark className="h-10 w-10 shrink-0" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => setReferralOpen(true)}
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Refer me
          </button>
          <Link
            href="#contact"
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-[oklch(0.14_0.04_75)] transition-colors hover:bg-accent-hover"
          >
            Book a call
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-text-primary md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/10 bg-bg-secondary/95 p-4 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-xl px-3 py-3 text-text-primary hover:bg-white/5"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <button
                type="button"
                className="rounded-xl px-3 py-3 text-left text-text-secondary hover:bg-white/5"
                onClick={() => {
                  setOpen(false);
                  setReferralOpen(true);
                }}
              >
                Refer me
              </button>
              <Link
                href="#contact"
                className="mt-2 rounded-full bg-accent py-3 text-center text-sm font-medium text-[oklch(0.14_0.04_75)]"
                onClick={() => setOpen(false)}
              >
                Book a call
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ReferralModal open={referralOpen} onClose={() => setReferralOpen(false)} />
    </header>
  );
}
