import type { NextRequest } from "next/server";

import { siteConfig } from "@/lib/site-config";

export const VISITOR_COOKIE = "aklile_vid";
export const SESSION_COOKIE = "aklile_sid";
export const REFERRAL_COOKIE = "aklile_ref";

export function getClientIp(request: NextRequest): string | null {
  const xfwd = request.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0]?.trim() ?? null;
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-vercel-forwarded-for") ??
    null
  );
}

export function getGeoFromHeaders(request: NextRequest) {
  return {
    country: request.headers.get("x-vercel-ip-country"),
    region: request.headers.get("x-vercel-ip-country-region"),
    city: request.headers.get("x-vercel-ip-city"),
    latitude: request.headers.get("x-vercel-ip-latitude"),
    longitude: request.headers.get("x-vercel-ip-longitude"),
    timezone: request.headers.get("x-vercel-ip-timezone"),
  };
}

export function getVisitorAndSession(request: NextRequest) {
  return {
    visitorId: request.cookies.get(VISITOR_COOKIE)?.value ?? null,
    sessionId: request.cookies.get(SESSION_COOKIE)?.value ?? null,
  };
}

export function getReferralCode(request: NextRequest) {
  const fromQuery = request.nextUrl.searchParams.get(siteConfig.referralParam);
  if (fromQuery) return sanitizeReferralCode(fromQuery);
  const fromCookie = request.cookies.get(REFERRAL_COOKIE)?.value;
  return fromCookie ? sanitizeReferralCode(fromCookie) : null;
}

export function sanitizeReferralCode(code: string) {
  const clean = code.trim();
  if (!/^[a-zA-Z0-9_-]{3,96}$/.test(clean)) return null;
  return clean;
}

function sanitizeReferralName(name: string) {
  const clean = name
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return clean || "ref";
}

export function generateReferralCode(name: string) {
  const namePart = sanitizeReferralName(name);
  const randomPart = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const timePart = Date.now().toString(36);
  return `${namePart}-${timePart}${randomPart}`;
}
