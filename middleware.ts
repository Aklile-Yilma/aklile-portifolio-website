import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { siteConfig } from "@/lib/site-config";
import {
  REFERRAL_COOKIE,
  SESSION_COOKIE,
  VISITOR_COOKIE,
  sanitizeReferralCode,
} from "@/lib/server/tracking";

const SESSION_MAX_AGE_SECONDS = 60 * 30; // 30 minutes
const VISITOR_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year
const REFERRAL_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const visitor = request.cookies.get(VISITOR_COOKIE)?.value;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (!visitor) {
    response.cookies.set(VISITOR_COOKIE, newId("v"), {
      path: "/",
      maxAge: VISITOR_MAX_AGE_SECONDS,
      sameSite: "lax",
      secure: true,
      httpOnly: false,
    });
  }

  response.cookies.set(SESSION_COOKIE, session ?? newId("s"), {
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: true,
    httpOnly: false,
  });

  const ref = request.nextUrl.searchParams.get(siteConfig.referralParam);
  if (ref) {
    const safe = sanitizeReferralCode(ref);
    if (safe) {
      response.cookies.set(REFERRAL_COOKIE, safe, {
        path: "/",
        maxAge: REFERRAL_MAX_AGE_SECONDS,
        sameSite: "lax",
        secure: true,
        httpOnly: false,
      });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
