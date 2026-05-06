"use client";

import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

const HOME_SCROLL_STORAGE_KEY = "aklile-portfolio:home-scroll-y";

function isWorkDetailPath(path: string): boolean {
  return /^\/work\/[^/]+$/.test(path);
}

function scrollDocumentTop(lenis: ReturnType<typeof useLenis>) {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
}

function readStoredHomeScroll(): number | null {
  try {
    const raw = sessionStorage.getItem(HOME_SCROLL_STORAGE_KEY);
    if (raw == null) return null;
    const y = Number.parseInt(raw, 10);
    if (Number.isNaN(y) || y < 0) return null;
    return y;
  } catch {
    return null;
  }
}

function restoreHomeScroll(lenis: ReturnType<typeof useLenis>) {
  const y = readStoredHomeScroll();
  if (y == null) return;

  if (lenis) {
    const max = Math.max(0, lenis.limit);
    lenis.scrollTo(Math.min(y, max), { immediate: true });
  } else {
    window.scrollTo(0, y);
  }
}

/**
 * Lenis keeps scroll offset across client navigations.
 * - Entering `/work/[slug]`: jump to top (case-study tiles, etc.).
 * - Leaving a work page back to `/`: restore last home scroll (sessionStorage).
 */
export function ScrollToTopOnRoute() {
  const pathname = usePathname();
  const lenis = useLenis();
  const prevPathnameRef = useRef<string | null>(null);

  // Persist vertical scroll while on the homepage so we can restore after /work/*.
  useEffect(() => {
    if (pathname !== "/") return;

    let rafId = 0;
    const save = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const y = lenis ? Math.round(lenis.scroll) : Math.round(window.scrollY);
        try {
          sessionStorage.setItem(HOME_SCROLL_STORAGE_KEY, String(y));
        } catch {
          /* quota / private mode */
        }
      });
    };

    save();

    if (lenis) {
      const unsub = lenis.on("scroll", save);
      return () => {
        unsub();
        cancelAnimationFrame(rafId);
      };
    }

    window.addEventListener("scroll", save, { passive: true });
    return () => {
      window.removeEventListener("scroll", save);
      cancelAnimationFrame(rafId);
    };
  }, [pathname, lenis]);

  useLayoutEffect(() => {
    const prev = prevPathnameRef.current;
    const next = pathname;
    prevPathnameRef.current = next;

    if (prev === null) {
      if (isWorkDetailPath(next)) {
        scrollDocumentTop(lenis);
      }
      return;
    }

    const prevWork = isWorkDetailPath(prev);
    const nextWork = isWorkDetailPath(next);

    if (nextWork) {
      scrollDocumentTop(lenis);
      return;
    }

    if (prevWork && next === "/") {
      restoreHomeScroll(lenis);
      requestAnimationFrame(() => restoreHomeScroll(lenis));
    }
  }, [pathname, lenis]);

  return null;
}
