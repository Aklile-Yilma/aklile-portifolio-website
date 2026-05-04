import { NextResponse, type NextRequest } from "next/server";

import {
  createStatsSessionValue,
  getStatsPassword,
  statsCookieName,
  statsSessionMaxAgeSeconds,
} from "@/lib/server/stats-auth";
import { consumeRateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/tracking";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/stats");
  const clientId =
    getClientIp(request) ??
    request.headers.get("x-forwarded-for") ??
    request.headers.get("user-agent") ??
    "unknown";

  const attempt = consumeRateLimit({
    key: `stats-login:${clientId}`,
    max: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (!attempt.allowed) {
    return NextResponse.redirect(new URL("/stats?error=rate_limited", request.url));
  }

  const expectedPassword = getStatsPassword();
  if (!expectedPassword) {
    return NextResponse.redirect(new URL("/stats?error=missing_password", request.url));
  }

  if (password !== expectedPassword) {
    return NextResponse.redirect(new URL("/stats?error=invalid_password", request.url));
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set(statsCookieName(), createStatsSessionValue(), {
    path: "/",
    maxAge: statsSessionMaxAgeSeconds(),
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
