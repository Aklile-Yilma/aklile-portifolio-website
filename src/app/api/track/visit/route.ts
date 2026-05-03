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
