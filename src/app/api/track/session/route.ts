import { NextResponse, type NextRequest } from "next/server";

import { db, ensureAnalyticsSchema } from "@/lib/server/analytics-db";
import { getGeoFromHeaders, getReferralCode, getVisitorAndSession } from "@/lib/server/tracking";

type SessionPayload = {
  activeMs?: number;
};

function asSafeActiveMs(input: unknown) {
  const n = Number(input);
  if (!Number.isFinite(n)) return 0;
  if (n <= 0) return 0;
  // Ignore suspiciously large jumps from a single client ping (30 min cap).
  return Math.min(Math.floor(n), 30 * 60 * 1000);
}

export async function POST(request: NextRequest) {
  try {
    await ensureAnalyticsSchema();
    const sql = db();
    const body = (await request.json().catch(() => ({}))) as SessionPayload;

    const activeMs = asSafeActiveMs(body.activeMs);
    if (activeMs <= 0) {
      return NextResponse.json(
        { ok: true },
        { headers: { "cache-control": "no-store" } },
      );
    }

    const { visitorId, sessionId } = getVisitorAndSession(request);
    if (!sessionId) {
      return NextResponse.json(
        { ok: true },
        { headers: { "cache-control": "no-store" } },
      );
    }

    const referralCode = getReferralCode(request);
    const geo = getGeoFromHeaders(request);

    await sql`
      INSERT INTO website_sessions (
        session_id,
        visitor_id,
        referral_code,
        active_ms_total,
        country,
        region,
        city,
        timezone
      ) VALUES (
        ${sessionId},
        ${visitorId},
        ${referralCode},
        ${activeMs},
        ${geo.country},
        ${geo.region},
        ${geo.city},
        ${geo.timezone}
      )
      ON CONFLICT (session_id) DO UPDATE SET
        visitor_id = COALESCE(EXCLUDED.visitor_id, website_sessions.visitor_id),
        referral_code = COALESCE(EXCLUDED.referral_code, website_sessions.referral_code),
        active_ms_total = website_sessions.active_ms_total + ${activeMs},
        last_seen_at = NOW(),
        country = COALESCE(EXCLUDED.country, website_sessions.country),
        region = COALESCE(EXCLUDED.region, website_sessions.region),
        city = COALESCE(EXCLUDED.city, website_sessions.city),
        timezone = COALESCE(EXCLUDED.timezone, website_sessions.timezone);
    `;

    return NextResponse.json(
      { ok: true },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Session tracking failed." },
      { status: 500 },
    );
  }
}
