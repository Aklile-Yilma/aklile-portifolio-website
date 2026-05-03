import { NextResponse, type NextRequest } from "next/server";

import {
  createStatsSessionValue,
  getStatsPassword,
  statsCookieName,
  statsSessionMaxAgeSeconds,
} from "@/lib/server/stats-auth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/stats");

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
