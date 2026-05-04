import { NextResponse, type NextRequest } from "next/server";

import { db, ensureAnalyticsSchema } from "@/lib/server/analytics-db";
import {
  getClientIp,
  getGeoFromHeaders,
  getReferralCode,
  getVisitorAndSession,
} from "@/lib/server/tracking";

type EventPayload = {
  name?: string;
  location?: string | null;
  href?: string | null;
  path?: string | null;
  fullUrl?: string | null;
  referrer?: string | null;
  meta?: Record<string, string | number | boolean | null> | null;
};

function sanitizeEventName(name?: string) {
  const clean = name?.trim();
  if (!clean) return null;
  if (clean.length > 80) return clean.slice(0, 80);
  return clean;
}

export async function POST(request: NextRequest) {
  try {
    await ensureAnalyticsSchema();
    const sql = db();
    const body = (await request.json().catch(() => ({}))) as EventPayload;

    const eventName = sanitizeEventName(body.name);
    if (!eventName) {
      return NextResponse.json(
        { ok: false, error: "Invalid event payload." },
        { status: 400 },
      );
    }

    const { visitorId, sessionId } = getVisitorAndSession(request);
    const referralCode = getReferralCode(request);
    const ip = getClientIp(request);
    const geo = getGeoFromHeaders(request);
    const userAgent = request.headers.get("user-agent");

    await sql`
      INSERT INTO website_events (
        event_name,
        event_location,
        href,
        path,
        full_url,
        referrer,
        visitor_id,
        session_id,
        referral_code,
        user_agent,
        ip_address,
        country,
        region,
        city,
        timezone,
        metadata
      ) VALUES (
        ${eventName},
        ${body.location ?? null},
        ${body.href ?? null},
        ${body.path ?? null},
        ${body.fullUrl ?? null},
        ${body.referrer ?? null},
        ${visitorId},
        ${sessionId},
        ${referralCode},
        ${userAgent},
        ${ip},
        ${geo.country},
        ${geo.region},
        ${geo.city},
        ${geo.timezone},
        ${body.meta ? JSON.stringify(body.meta) : null}
      );
    `;

    return NextResponse.json(
      { ok: true },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Event tracking failed." },
      { status: 500 },
    );
  }
}
