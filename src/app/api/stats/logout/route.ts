import { NextResponse, type NextRequest } from "next/server";

import { statsCookieName } from "@/lib/server/stats-auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/stats", request.url));
  response.cookies.set(statsCookieName(), "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
