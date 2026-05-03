import { NextResponse, type NextRequest } from "next/server";

import { referralShareUrl } from "@/lib/site-config";
import { db, ensureAnalyticsSchema } from "@/lib/server/analytics-db";
import {
  generateReferralCode,
  getClientIp,
  getGeoFromHeaders,
  getVisitorAndSession,
} from "@/lib/server/tracking";

export async function POST(request: NextRequest) {
  try {
    await ensureAnalyticsSchema();
    const sql = db();

    const { visitorId, sessionId } = getVisitorAndSession(request);
    const { country, region, city } = getGeoFromHeaders(request);
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent");

    for (let i = 0; i < 6; i++) {
      const code = generateReferralCode();
      const rows = await sql`
        INSERT INTO referrals (
          code,
          created_by_visitor_id,
          created_by_session_id,
          created_ip,
          created_country,
          created_region,
          created_city,
          created_user_agent
        ) VALUES (
          ${code},
          ${visitorId},
          ${sessionId},
          ${ip},
          ${country},
          ${region},
          ${city},
          ${userAgent}
        )
        ON CONFLICT (code) DO NOTHING
        RETURNING code;
      `;

      if (rows.length) {
        const referralCode = String((rows[0] as { code: string }).code);
        return NextResponse.json(
          {
            code: referralCode,
            url: referralShareUrl(referralCode),
          },
          {
            headers: { "cache-control": "no-store" },
          },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate a unique referral code." },
      { status: 500 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Referral creation failed.", detail: message },
      { status: 500 },
    );
  }
}
