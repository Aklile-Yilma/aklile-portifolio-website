"use client";

import { Calendar, MessageCircle } from "lucide-react";
import Link from "next/link";

import { trackEvent } from "@/lib/analytics";
import { whatsappHref } from "@/lib/site-config";

export function MobileStickyCta() {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-white/10 bg-bg-primary/90 p-3 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-lg gap-2">
        <Link
          href="#contact"
          onClick={() =>
            trackEvent({
              name: "cta_book_call_click",
              location: "mobile_sticky",
              href: "#contact",
            })
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-[oklch(0.14_0.04_75)]"
        >
          <Calendar className="h-4 w-4" />
          Book
        </Link>
        <Link
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackEvent({
              name: "cta_whatsapp_click",
              location: "mobile_sticky",
              href: whatsappHref(),
            })
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-text-primary"
        >
          <MessageCircle className="h-4 w-4 text-accent" />
          WhatsApp
        </Link>
      </div>
    </div>
  );
}
