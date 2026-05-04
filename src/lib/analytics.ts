"use client";

export type TrackEventPayload = {
  name: string;
  location?: string;
  href?: string;
  meta?: Record<string, string | number | boolean | null>;
};

export function trackEvent(payload: TrackEventPayload) {
  if (typeof window === "undefined") return;
  if (!payload?.name) return;

  const body = JSON.stringify({
    name: payload.name,
    location: payload.location ?? null,
    href: payload.href ?? null,
    meta: payload.meta ?? null,
    path: window.location.pathname,
    fullUrl: window.location.href,
    referrer: document.referrer || null,
  });

  try {
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/track/event", blob);
      return;
    }
  } catch {
    // Ignore and fall back to fetch.
  }

  void fetch("/api/track/event", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
    cache: "no-store",
  }).catch(() => {
    // Non-blocking analytics path: swallow transport failures.
  });
}
