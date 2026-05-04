"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function VisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sentKeys = useRef<Set<string>>(new Set());
  const activeStartRef = useRef<number | null>(null);
  const bufferedActiveMsRef = useRef(0);

  const flushActiveTime = (useBeacon = false) => {
    if (typeof window === "undefined") return;

    const activeMs = Math.floor(bufferedActiveMsRef.current);
    if (activeMs <= 0) return;
    bufferedActiveMsRef.current = 0;

    const body = JSON.stringify({ activeMs });

    if (useBeacon && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/track/session", blob);
      return;
    }

    fetch("/api/track/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
      cache: "no-store",
    }).catch(() => {
      // Non-blocking analytics path: swallow transport failures.
    });
  };

  const captureElapsedActiveTime = () => {
    if (activeStartRef.current === null) return;
    const now = Date.now();
    bufferedActiveMsRef.current += Math.max(0, now - activeStartRef.current);
    activeStartRef.current = now;
  };

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

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (document.visibilityState === "visible") {
      activeStartRef.current = Date.now();
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        captureElapsedActiveTime();
        activeStartRef.current = null;
        flushActiveTime(true);
      } else {
        activeStartRef.current = Date.now();
      }
    };

    const onPageHide = () => {
      captureElapsedActiveTime();
      activeStartRef.current = null;
      flushActiveTime(true);
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      captureElapsedActiveTime();
      flushActiveTime(false);
    }, 15000);

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      captureElapsedActiveTime();
      flushActiveTime(true);
    };
  }, []);

  return null;
}
