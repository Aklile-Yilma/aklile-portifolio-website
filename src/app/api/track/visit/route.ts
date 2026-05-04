import { NextResponse, type NextRequest } from "next/server";

import { db, ensureAnalyticsSchema } from "@/lib/server/analytics-db";
import {
  getClientIp,
  getGeoFromHeaders,
  getReferralCode,
  getVisitorAndSession,
} from "@/lib/server/tracking";

type VisitPayload = {
  path?: string;
  fullUrl?: string;
  referrer?: string | null;
};

function getUtm(url?: string) {
  if (!url) return {};
  try {
    const u = new URL(url);
    return {
      utmSource: u.searchParams.get("utm_source"),
      utmMedium: u.searchParams.get("utm_medium"),
      utmCampaign: u.searchParams.get("utm_campaign"),
      utmTerm: u.searchParams.get("utm_term"),
      utmContent: u.searchParams.get("utm_content"),
      queryString: u.searchParams.toString() || null,
    };
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureAnalyticsSchema();
    const sql = db();
    const body = (await request.json().catch(() => ({}))) as VisitPayload;

    const { visitorId, sessionId } = getVisitorAndSession(request);
    const referralCode = getReferralCode(request);
    const ip = getClientIp(request);
    const geo = getGeoFromHeaders(request);
    const userAgent = request.headers.get("user-agent");
    const utm = getUtm(body.fullUrl);

    await sql`
      INSERT INTO website_visits (
        visitor_id,
        session_id,
        referral_code,
        path,
        full_url,
        referrer,
        method,
        user_agent,
        ip_address,
        country,
        region,
        city,
        latitude,
        longitude,
        timezone,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        query_string
      ) VALUES (
        ${visitorId},
        ${sessionId},
        ${referralCode},
        ${body.path ?? null},
        ${body.fullUrl ?? null},
        ${body.referrer ?? null},
        ${request.method},
        ${userAgent},
        ${ip},
        ${geo.country},
        ${geo.region},
        ${geo.city},
        ${geo.latitude},
        ${geo.longitude},
        ${geo.timezone},
        ${utm.utmSource ?? null},
        ${utm.utmMedium ?? null},
        ${utm.utmCampaign ?? null},
        ${utm.utmTerm ?? null},
        ${utm.utmContent ?? null},
        ${utm.queryString ?? null}
      );
    `;

    if (sessionId) {
      await sql`
        INSERT INTO website_sessions (
          session_id,
          visitor_id,
          referral_code,
          visit_count,
          country,
          region,
          city,
          timezone
        ) VALUES (
          ${sessionId},
          ${visitorId},
          ${referralCode},
          1,
          ${geo.country},
          ${geo.region},
          ${geo.city},
          ${geo.timezone}
        )
        ON CONFLICT (session_id) DO UPDATE SET
          visitor_id = COALESCE(EXCLUDED.visitor_id, website_sessions.visitor_id),
          referral_code = COALESCE(EXCLUDED.referral_code, website_sessions.referral_code),
          visit_count = website_sessions.visit_count + 1,
          last_seen_at = NOW(),
          country = COALESCE(EXCLUDED.country, website_sessions.country),
          region = COALESCE(EXCLUDED.region, website_sessions.region),
          city = COALESCE(EXCLUDED.city, website_sessions.city),
          timezone = COALESCE(EXCLUDED.timezone, website_sessions.timezone);
      `;
    }

    return NextResponse.json(
      { ok: true },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Visit tracking failed.", detail: message },
      { status: 500 },
    );
  }
}
