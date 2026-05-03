"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function VisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sentKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!pathname) return;

    const qs = searchParams?.toString() ?? "";
    const key = qs ? `${pathname}?${qs}` : pathname;
    if (sentKeys.current.has(key)) return;
    sentKeys.current.add(key);

    const payload = {
      path: pathname,
      fullUrl: window.location.href,
      referrer: document.referrer || null,
    };

    fetch("/api/track/visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      cache: "no-store",
    }).catch(() => {
      // Non-blocking analytics path: swallow transport failures.
    });
  }, [pathname, searchParams]);

  return null;
}
