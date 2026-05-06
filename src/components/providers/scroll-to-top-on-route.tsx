"use client";

import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

const HOME_SCROLL_STORAGE_KEY = "aklile-portfolio:home-scroll-y";

/** After work → home, ignore Lenis scroll reads briefly (stale work offset would overwrite storage). */
const HOME_SAVE_SUPPRESS_MS = 700;

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

  lenis?.resize();

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
  const suppressHomeScrollSaveUntilRef = useRef(0);

  // Persist vertical scroll while on the homepage (only on real scroll — no eager save on mount).
  useEffect(() => {
    if (pathname !== "/") return;

    let rafId = 0;
    const save = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (performance.now() < suppressHomeScrollSaveUntilRef.current) {
          return;
        }
        const y = lenis ? Math.round(lenis.scroll) : Math.round(window.scrollY);
        try {
          sessionStorage.setItem(HOME_SCROLL_STORAGE_KEY, String(y));
        } catch {
          /* quota / private mode */
        }
      });
    };

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
      suppressHomeScrollSaveUntilRef.current = performance.now() + HOME_SAVE_SUPPRESS_MS;

      const run = () => restoreHomeScroll(lenis);
      run();
      requestAnimationFrame(() => {
        run();
        requestAnimationFrame(() => {
          run();
        });
      });
    }
  }, [pathname, lenis]);

  return null;
}
