import { NextResponse, type NextRequest } from "next/server";

import { getStatsTableData } from "@/lib/server/stats-tables";
import { statsCookieName, verifyStatsSessionValue } from "@/lib/server/stats-auth";
import type { StatsTableKey } from "@/lib/stats-table-config";

function asTable(v: string | null): StatsTableKey | null {
  if (v === "sessions" || v === "visits" || v === "referrals" || v === "events") return v;
  return null;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(statsCookieName())?.value;
  if (!verifyStatsSessionValue(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = request.nextUrl.searchParams;
  const table = asTable(sp.get("table"));
  if (!table) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  try {
    const data = await getStatsTableData(table, {
      page: sp.get("page") ?? undefined,
      q: sp.get("q") ?? undefined,
      country: sp.get("country") ?? undefined,
      referral: sp.get("referral") ?? undefined,
      source: sp.get("source") ?? undefined,
      eventName: sp.get("eventName") ?? undefined,
      month: sp.get("month") ?? undefined,
      dateFrom: sp.get("dateFrom") ?? undefined,
      dateTo: sp.get("dateTo") ?? undefined,
      sortBy: sp.get("sortBy") ?? undefined,
      sortDir: sp.get("sortDir") ?? undefined,
    });

    return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Failed to load table data" }, { status: 500 });
  }
}

