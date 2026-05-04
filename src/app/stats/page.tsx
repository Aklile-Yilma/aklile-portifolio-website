import Link from "next/link";

import { db, ensureAnalyticsSchema } from "@/lib/server/analytics-db";
import { getStatsPassword, isStatsAuthenticated } from "@/lib/server/stats-auth";

export const dynamic = "force-dynamic";

type DashboardData = {
  totals: {
    visits: number;
    uniqueVisitors: number;
    uniqueSessions: number;
    referralCodes: number;
    events: number;
    minutesSpent: number;
  };
  visitsByDay: Array<{ day: string; visits: number }>;
  topCountries: Array<{ country: string; visits: number }>;
};

type RowRecord = Record<string, unknown>;

type TableData = {
  rows: RowRecord[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
};

const PAGE_SIZE = 20;

const visitsColumns = [
  "id",
  "created_at",
  "visitor_id",
  "session_id",
  "referral_code",
  "path",
  "full_url",
  "referrer",
  "method",
  "user_agent",
  "ip_address",
  "country",
  "region",
  "city",
  "latitude",
  "longitude",
  "timezone",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "query_string",
] as const;

const referralsColumns = [
  "code",
  "referrer_name",
  "created_at",
  "created_by_visitor_id",
  "created_by_session_id",
  "created_ip",
  "created_country",
  "created_region",
  "created_city",
  "created_user_agent",
  "source",
] as const;

const eventsColumns = [
  "id",
  "created_at",
  "event_name",
  "event_location",
  "href",
  "path",
  "full_url",
  "referrer",
  "visitor_id",
  "session_id",
  "referral_code",
  "user_agent",
  "ip_address",
  "country",
  "region",
  "city",
  "timezone",
  "metadata",
] as const;

const sessionLeaderboardColumns = [
  "session_id",
  "visitor_id",
  "visit_count",
  "event_count",
  "minutes_spent",
  "referral_code",
  "country",
  "first_seen_at",
  "last_seen_at",
] as const;

function num(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function maxOrOne(nums: number[]) {
  const m = Math.max(...nums, 0);
  return m > 0 ? m : 1;
}

async function getDashboardData(): Promise<DashboardData> {
  await ensureAnalyticsSchema();
  const sql = db();

  const [visitsRow = {}] = await sql`SELECT COUNT(*) AS count FROM website_visits;`;
  const [visitorsRow = {}] =
    await sql`SELECT COUNT(DISTINCT visitor_id) AS count FROM website_visits WHERE visitor_id IS NOT NULL;`;
  const [sessionsRow = {}] =
    await sql`SELECT COUNT(DISTINCT session_id) AS count FROM website_visits WHERE session_id IS NOT NULL;`;
  const [referralRow = {}] = await sql`SELECT COUNT(*) AS count FROM referrals;`;
  const [eventsRow = {}] = await sql`SELECT COUNT(*) AS count FROM website_events;`;
  const [minutesRow = {}] =
    await sql`SELECT COALESCE(SUM(active_ms_total), 0) AS total_ms FROM website_sessions;`;

  const visitsByDayRows = await sql`
    SELECT TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*) AS visits
    FROM website_visits
    WHERE created_at >= NOW() - INTERVAL '14 days'
    GROUP BY 1
    ORDER BY 1 ASC;
  `;

  const topCountriesRows = await sql`
    SELECT COALESCE(country, 'Unknown') AS country, COUNT(*) AS visits
    FROM website_visits
    GROUP BY 1
    ORDER BY 2 DESC
    LIMIT 8;
  `;

  return {
    totals: {
      visits: num((visitsRow as { count?: string | number }).count),
      uniqueVisitors: num((visitorsRow as { count?: string | number }).count),
      uniqueSessions: num((sessionsRow as { count?: string | number }).count),
      referralCodes: num((referralRow as { count?: string | number }).count),
      events: num((eventsRow as { count?: string | number }).count),
      minutesSpent: Math.round(num((minutesRow as { total_ms?: string | number }).total_ms) / 60000),
    },
    visitsByDay: visitsByDayRows.map((r) => ({
      day: String((r as { day?: string }).day ?? ""),
      visits: num((r as { visits?: string | number }).visits),
    })),
    topCountries: topCountriesRows.map((r) => ({
      country: String((r as { country?: string }).country ?? "Unknown"),
      visits: num((r as { visits?: string | number }).visits),
    })),
  };
}

function normalizeParams(
  raw?: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") out[key] = value;
    else if (Array.isArray(value) && typeof value[0] === "string") out[key] = value[0];
  }
  return out;
}

function asPage(v: string | undefined) {
  const parsed = Number(v);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function withParams(params: Record<string, string>, updates: Record<string, string | number | null>) {
  const sp = new URLSearchParams(params);
  for (const [k, v] of Object.entries(updates)) {
    if (v === null || v === "" || v === 1) sp.delete(k);
    else sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `/stats?${qs}` : "/stats";
}

function prettyColumnName(name: string) {
  return name.replaceAll("_", " ");
}

function formatCellValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (key === "created_at" || key === "first_seen_at" || key === "last_seen_at") {
    const d = new Date(String(value));
    if (!Number.isNaN(d.getTime())) return d.toLocaleString();
  }
  if (key === "minutes_spent") {
    const n = Number(value);
    if (Number.isFinite(n)) return `${n.toFixed(2)} min`;
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

async function getVisitsTable(input: {
  page: number;
  q: string;
  country: string;
  referral: string;
}): Promise<TableData> {
  await ensureAnalyticsSchema();
  const sql = db();

  const q = input.q.trim();
  const country = input.country.trim();
  const referral = input.referral.trim();
  const qLike = `%${q}%`;
  const countryLike = `%${country}%`;
  const referralLike = `%${referral}%`;

  const [countRow = {}] = await sql`
    SELECT COUNT(*) AS count
    FROM website_visits
    WHERE
      (${q} = '' OR CONCAT_WS(
        ' ',
        COALESCE(path, ''),
        COALESCE(full_url, ''),
        COALESCE(referrer, ''),
        COALESCE(user_agent, ''),
        COALESCE(ip_address, ''),
        COALESCE(utm_source, ''),
        COALESCE(utm_medium, ''),
        COALESCE(utm_campaign, ''),
        COALESCE(utm_term, ''),
        COALESCE(utm_content, ''),
        COALESCE(query_string, '')
      ) ILIKE ${qLike})
      AND (${country} = '' OR COALESCE(country, '') ILIKE ${countryLike})
      AND (${referral} = '' OR COALESCE(referral_code, '') ILIKE ${referralLike});
  `;
  const total = num((countRow as { count?: string | number }).count);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, input.page), totalPages);
  const offset = (page - 1) * PAGE_SIZE;

  const rows = await sql`
    SELECT
      id,
      created_at,
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
    FROM website_visits
    WHERE
      (${q} = '' OR CONCAT_WS(
        ' ',
        COALESCE(path, ''),
        COALESCE(full_url, ''),
        COALESCE(referrer, ''),
        COALESCE(user_agent, ''),
        COALESCE(ip_address, ''),
        COALESCE(utm_source, ''),
        COALESCE(utm_medium, ''),
        COALESCE(utm_campaign, ''),
        COALESCE(utm_term, ''),
        COALESCE(utm_content, ''),
        COALESCE(query_string, '')
      ) ILIKE ${qLike})
      AND (${country} = '' OR COALESCE(country, '') ILIKE ${countryLike})
      AND (${referral} = '' OR COALESCE(referral_code, '') ILIKE ${referralLike})
    ORDER BY created_at DESC
    LIMIT ${PAGE_SIZE}
    OFFSET ${offset};
  `;

  return { rows: rows as RowRecord[], total, page, totalPages, pageSize: PAGE_SIZE };
}

async function getReferralsTable(input: {
  page: number;
  q: string;
  country: string;
  source: string;
}): Promise<TableData> {
  await ensureAnalyticsSchema();
  const sql = db();

  const q = input.q.trim();
  const country = input.country.trim();
  const source = input.source.trim();
  const qLike = `%${q}%`;
  const countryLike = `%${country}%`;
  const sourceLike = `%${source}%`;

  const [countRow = {}] = await sql`
    SELECT COUNT(*) AS count
    FROM referrals
    WHERE
      (${q} = '' OR CONCAT_WS(
        ' ',
        COALESCE(code, ''),
        COALESCE(referrer_name, ''),
        COALESCE(created_ip, ''),
        COALESCE(created_user_agent, '')
      ) ILIKE ${qLike})
      AND (${country} = '' OR COALESCE(created_country, '') ILIKE ${countryLike})
      AND (${source} = '' OR COALESCE(source, '') ILIKE ${sourceLike});
  `;
  const total = num((countRow as { count?: string | number }).count);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, input.page), totalPages);
  const offset = (page - 1) * PAGE_SIZE;

  const rows = await sql`
    SELECT
      code,
      referrer_name,
      created_at,
      created_by_visitor_id,
      created_by_session_id,
      created_ip,
      created_country,
      created_region,
      created_city,
      created_user_agent,
      source
    FROM referrals
    WHERE
      (${q} = '' OR CONCAT_WS(
        ' ',
        COALESCE(code, ''),
        COALESCE(referrer_name, ''),
        COALESCE(created_ip, ''),
        COALESCE(created_user_agent, '')
      ) ILIKE ${qLike})
      AND (${country} = '' OR COALESCE(created_country, '') ILIKE ${countryLike})
      AND (${source} = '' OR COALESCE(source, '') ILIKE ${sourceLike})
    ORDER BY created_at DESC
    LIMIT ${PAGE_SIZE}
    OFFSET ${offset};
  `;

  return { rows: rows as RowRecord[], total, page, totalPages, pageSize: PAGE_SIZE };
}

async function getEventsTable(input: {
  page: number;
  q: string;
  eventName: string;
  country: string;
}): Promise<TableData> {
  await ensureAnalyticsSchema();
  const sql = db();

  const q = input.q.trim();
  const eventName = input.eventName.trim();
  const country = input.country.trim();
  const qLike = `%${q}%`;
  const eventLike = `%${eventName}%`;
  const countryLike = `%${country}%`;

  const [countRow = {}] = await sql`
    SELECT COUNT(*) AS count
    FROM website_events
    WHERE
      (${q} = '' OR CONCAT_WS(
        ' ',
        COALESCE(href, ''),
        COALESCE(path, ''),
        COALESCE(full_url, ''),
        COALESCE(referrer, ''),
        COALESCE(user_agent, ''),
        COALESCE(ip_address, '')
      ) ILIKE ${qLike})
      AND (${eventName} = '' OR COALESCE(event_name, '') ILIKE ${eventLike})
      AND (${country} = '' OR COALESCE(country, '') ILIKE ${countryLike});
  `;
  const total = num((countRow as { count?: string | number }).count);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, input.page), totalPages);
  const offset = (page - 1) * PAGE_SIZE;

  const rows = await sql`
    SELECT
      id,
      created_at,
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
    FROM website_events
    WHERE
      (${q} = '' OR CONCAT_WS(
        ' ',
        COALESCE(href, ''),
        COALESCE(path, ''),
        COALESCE(full_url, ''),
        COALESCE(referrer, ''),
        COALESCE(user_agent, ''),
        COALESCE(ip_address, '')
      ) ILIKE ${qLike})
      AND (${eventName} = '' OR COALESCE(event_name, '') ILIKE ${eventLike})
      AND (${country} = '' OR COALESCE(country, '') ILIKE ${countryLike})
    ORDER BY created_at DESC
    LIMIT ${PAGE_SIZE}
    OFFSET ${offset};
  `;

  return { rows: rows as RowRecord[], total, page, totalPages, pageSize: PAGE_SIZE };
}

type SessionSort = "visits" | "events" | "minutes";

function asSessionSort(v: string | undefined): SessionSort {
  if (v === "events") return "events";
  if (v === "minutes") return "minutes";
  return "visits";
}

async function getSessionLeaderboardTable(input: {
  page: number;
  q: string;
  sort: SessionSort;
}): Promise<TableData> {
  await ensureAnalyticsSchema();
  const sql = db();

  const q = input.q.trim();
  const qLike = `%${q}%`;

  const [countRow = {}] = await sql`
    SELECT COUNT(*) AS count
    FROM website_sessions
    WHERE
      (${q} = '' OR CONCAT_WS(
        ' ',
        COALESCE(session_id, ''),
        COALESCE(visitor_id, ''),
        COALESCE(referral_code, ''),
        COALESCE(country, '')
      ) ILIKE ${qLike});
  `;
  const total = num((countRow as { count?: string | number }).count);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, input.page), totalPages);
  const offset = (page - 1) * PAGE_SIZE;

  const rows =
    input.sort === "events"
      ? await sql`
          SELECT
            s.session_id,
            s.visitor_id,
            s.visit_count,
            COALESCE(e.event_count, 0) AS event_count,
            ROUND((s.active_ms_total::numeric) / 60000, 2) AS minutes_spent,
            s.referral_code,
            s.country,
            s.first_seen_at,
            s.last_seen_at
          FROM website_sessions s
          LEFT JOIN (
            SELECT session_id, COUNT(*) AS event_count
            FROM website_events
            WHERE session_id IS NOT NULL
            GROUP BY 1
          ) e ON e.session_id = s.session_id
          WHERE
            (${q} = '' OR CONCAT_WS(
              ' ',
              COALESCE(s.session_id, ''),
              COALESCE(s.visitor_id, ''),
              COALESCE(s.referral_code, ''),
              COALESCE(s.country, '')
            ) ILIKE ${qLike})
          ORDER BY event_count DESC, s.active_ms_total DESC, s.visit_count DESC
          LIMIT ${PAGE_SIZE}
          OFFSET ${offset};
        `
      : input.sort === "minutes"
        ? await sql`
            SELECT
              s.session_id,
              s.visitor_id,
              s.visit_count,
              COALESCE(e.event_count, 0) AS event_count,
              ROUND((s.active_ms_total::numeric) / 60000, 2) AS minutes_spent,
              s.referral_code,
              s.country,
              s.first_seen_at,
              s.last_seen_at
            FROM website_sessions s
            LEFT JOIN (
              SELECT session_id, COUNT(*) AS event_count
              FROM website_events
              WHERE session_id IS NOT NULL
              GROUP BY 1
            ) e ON e.session_id = s.session_id
            WHERE
              (${q} = '' OR CONCAT_WS(
                ' ',
                COALESCE(s.session_id, ''),
                COALESCE(s.visitor_id, ''),
                COALESCE(s.referral_code, ''),
                COALESCE(s.country, '')
              ) ILIKE ${qLike})
            ORDER BY s.active_ms_total DESC, event_count DESC, s.visit_count DESC
            LIMIT ${PAGE_SIZE}
            OFFSET ${offset};
          `
        : await sql`
            SELECT
              s.session_id,
              s.visitor_id,
              s.visit_count,
              COALESCE(e.event_count, 0) AS event_count,
              ROUND((s.active_ms_total::numeric) / 60000, 2) AS minutes_spent,
              s.referral_code,
              s.country,
              s.first_seen_at,
              s.last_seen_at
            FROM website_sessions s
            LEFT JOIN (
              SELECT session_id, COUNT(*) AS event_count
              FROM website_events
              WHERE session_id IS NOT NULL
              GROUP BY 1
            ) e ON e.session_id = s.session_id
            WHERE
              (${q} = '' OR CONCAT_WS(
                ' ',
                COALESCE(s.session_id, ''),
                COALESCE(s.visitor_id, ''),
                COALESCE(s.referral_code, ''),
                COALESCE(s.country, '')
              ) ILIKE ${qLike})
            ORDER BY s.visit_count DESC, event_count DESC, s.active_ms_total DESC
            LIMIT ${PAGE_SIZE}
            OFFSET ${offset};
          `;

  return { rows: rows as RowRecord[], total, page, totalPages, pageSize: PAGE_SIZE };
}

function HiddenParams({
  params,
  exclude,
}: {
  params: Record<string, string>;
  exclude: string[];
}) {
  return (
    <>
      {Object.entries(params)
        .filter(([k]) => !exclude.includes(k))
        .map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
    </>
  );
}

function Pagination({
  params,
  pageKey,
  page,
  totalPages,
}: {
  params: Record<string, string>;
  pageKey: string;
  page: number;
  totalPages: number;
}) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
      <p className="text-text-tertiary">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={withParams(params, { [pageKey]: page - 1 })}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-text-secondary hover:bg-white/5 hover:text-text-primary"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-lg border border-white/10 px-3 py-1.5 text-text-tertiary/60">
            Previous
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={withParams(params, { [pageKey]: page + 1 })}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-text-secondary hover:bg-white/5 hover:text-text-primary"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-lg border border-white/10 px-3 py-1.5 text-text-tertiary/60">
            Next
          </span>
        )}
      </div>
    </div>
  );
}

function DataTable({
  title,
  subtitle,
  columns,
  rows,
}: {
  title: string;
  subtitle: string;
  columns: readonly string[];
  rows: RowRecord[];
}) {
  return (
    <div className="glass overflow-hidden rounded-2xl border border-white/10">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-1 text-xs text-text-tertiary">{subtitle}</p>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.08em] text-text-tertiary">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-3 py-2 text-left whitespace-nowrap">
                  {prettyColumnName(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, idx) => (
                <tr key={String(row.id ?? row.code ?? row.created_at ?? idx)} className="border-t border-white/6">
                  {columns.map((column) => (
                    <td
                      key={`${String(row.id ?? row.code ?? idx)}-${column}`}
                      className="max-w-[28rem] px-3 py-2 align-top font-mono text-xs text-text-secondary"
                      title={formatCellValue(column, row[column])}
                    >
                      <span className="line-clamp-3 break-all">{formatCellValue(column, row[column])}</span>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-6 text-center text-sm text-text-tertiary"
                >
                  No rows found for the current search and filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoginForm({ error }: { error?: string }) {
  return (
    <main className="min-h-dvh bg-bg-primary px-4 py-14 md:px-6">
      <div className="mx-auto max-w-md">
        <div className="glass rounded-2xl border border-white/10 p-6 md:p-8">
          <h1 className="font-display text-2xl font-semibold text-text-primary">
            Stats Dashboard
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Enter your private password to access visit and referral analytics.
          </p>

          <form method="post" action="/api/stats/login" className="mt-6 space-y-3">
            <input type="hidden" name="next" value="/stats" />
            <label className="block">
              <span className="mb-2 block text-sm text-text-secondary">Password</span>
              <input
                type="password"
                name="password"
                required
                className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2.5 text-sm text-text-primary outline-none ring-accent/40 transition focus:ring-2"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-[oklch(0.14_0.04_75)] transition-colors hover:bg-accent-hover"
            >
              Unlock dashboard
            </button>
          </form>

          {error ? (
            <p className="mt-3 text-xs text-red-300">
              {error === "invalid_password"
                ? "Wrong password."
                : error === "rate_limited"
                  ? "Too many attempts. Try again in a few minutes."
                  : "Stats password is not configured on the server."}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-4 md:p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-text-primary md:text-3xl">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const parsedParams = normalizeParams(params);
  const error = parsedParams.error;
  const statsPasswordExists = Boolean(getStatsPassword());

  const authed = await isStatsAuthenticated();
  if (!authed) return <LoginForm error={statsPasswordExists ? error : "missing_password"} />;

  let data: DashboardData | null = null;
  let visitsTable: TableData | null = null;
  let referralsTable: TableData | null = null;
  let eventsTable: TableData | null = null;
  let sessionLeaderboardTable: TableData | null = null;
  let dataError: string | null = null;

  try {
    [
      data,
      visitsTable,
      referralsTable,
      eventsTable,
      sessionLeaderboardTable,
    ] = await Promise.all([
      getDashboardData(),
      getVisitsTable({
        page: asPage(parsedParams.visitPage),
        q: parsedParams.visitQ ?? "",
        country: parsedParams.visitCountry ?? "",
        referral: parsedParams.visitReferral ?? "",
      }),
      getReferralsTable({
        page: asPage(parsedParams.refPage),
        q: parsedParams.refQ ?? "",
        country: parsedParams.refCountry ?? "",
        source: parsedParams.refSource ?? "",
      }),
      getEventsTable({
        page: asPage(parsedParams.eventPage),
        q: parsedParams.eventQ ?? "",
        eventName: parsedParams.eventName ?? "",
        country: parsedParams.eventCountry ?? "",
      }),
      getSessionLeaderboardTable({
        page: asPage(parsedParams.sessPage),
        q: parsedParams.sessQ ?? "",
        sort: asSessionSort(parsedParams.sessSort),
      }),
    ]);
  } catch (err) {
    dataError = err instanceof Error ? err.message : "Failed to load stats.";
  }

  if (
    !data ||
    !visitsTable ||
    !referralsTable ||
    !eventsTable ||
    !sessionLeaderboardTable ||
    dataError
  ) {
    return (
      <main className="min-h-dvh bg-bg-primary px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="glass rounded-2xl border border-red-300/30 p-5 text-red-100">
            <p className="font-semibold">Stats page is authenticated, but data failed to load.</p>
            <p className="mt-2 text-sm opacity-90">{dataError ?? "Unknown error"}</p>
            <p className="mt-2 text-xs opacity-80">
              Check that <code>DATABASE_URL</code> points to a reachable Neon database.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const dayMax = maxOrOne(data.visitsByDay.map((d) => d.visits));
  const countryMax = maxOrOne(data.topCountries.map((c) => c.visits));

  return (
    <main className="min-h-dvh bg-bg-primary px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text-primary md:text-3xl">
              Aklile.dev stats
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Website visits and referral analytics (server-side protected).
            </p>
          </div>
          <form method="post" action="/api/stats/logout">
            <button
              type="submit"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              Logout
            </button>
          </form>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard label="Total visits" value={data.totals.visits} />
          <StatCard label="Unique visitors" value={data.totals.uniqueVisitors} />
          <StatCard label="Unique sessions" value={data.totals.uniqueSessions} />
          <StatCard label="Referral codes" value={data.totals.referralCodes} />
          <StatCard label="Tracked events" value={data.totals.events} />
          <StatCard label="Minutes spent" value={data.totals.minutesSpent} />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="glass rounded-2xl border border-white/10 p-4 md:p-5">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Visits by day (last 14 days)
            </h2>
            <div className="mt-4 space-y-2">
              {data.visitsByDay.length ? (
                data.visitsByDay.map((row) => (
                  <div key={row.day}>
                    <div className="mb-1 flex items-center justify-between text-xs text-text-tertiary">
                      <span>{row.day}</span>
                      <span>{row.visits}</span>
                    </div>
                    <div className="h-2 rounded bg-white/8">
                      <div
                        className="h-2 rounded bg-accent"
                        style={{ width: `${(row.visits / dayMax) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-tertiary">No visit data yet.</p>
              )}
            </div>
          </div>

          <div className="glass rounded-2xl border border-white/10 p-4 md:p-5">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Top countries
            </h2>
            <div className="mt-4 space-y-2">
              {data.topCountries.length ? (
                data.topCountries.map((row) => (
                  <div key={row.country}>
                    <div className="mb-1 flex items-center justify-between text-xs text-text-tertiary">
                      <span>{row.country}</span>
                      <span>{row.visits}</span>
                    </div>
                    <div className="h-2 rounded bg-white/8">
                      <div
                        className="h-2 rounded bg-[oklch(0.72_0.13_58)]"
                        style={{ width: `${(row.visits / countryMax) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-tertiary">No country data yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <form method="get" action="/stats" className="glass rounded-2xl border border-white/10 p-4">
            <HiddenParams params={parsedParams} exclude={["sessPage", "sessQ", "sessSort"]} />
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <label className="flex min-w-56 flex-1 flex-col gap-1 text-xs text-text-tertiary">
                Search session
                <input
                  name="sessQ"
                  defaultValue={parsedParams.sessQ ?? ""}
                  placeholder="session id, visitor, country, referral..."
                  className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2"
                />
              </label>
              <label className="flex min-w-64 flex-1 flex-col gap-1 text-xs text-text-tertiary">
                Sort by
                <select
                  name="sessSort"
                  defaultValue={asSessionSort(parsedParams.sessSort)}
                  className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2"
                >
                  <option value="visits">Most visits by session</option>
                  <option value="events">Most events by session</option>
                  <option value="minutes">Most minutes spent by session</option>
                </select>
              </label>
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[oklch(0.14_0.04_75)] hover:bg-accent-hover"
              >
                Apply
              </button>
              <Link
                href={withParams(parsedParams, {
                  sessPage: null,
                  sessQ: null,
                  sessSort: null,
                })}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary"
              >
                Clear
              </Link>
            </div>
            <DataTable
              title="session_leaderboard"
              subtitle={`${sessionLeaderboardTable.total.toLocaleString()} sessions total`}
              columns={sessionLeaderboardColumns}
              rows={sessionLeaderboardTable.rows}
            />
            <Pagination
              params={parsedParams}
              pageKey="sessPage"
              page={sessionLeaderboardTable.page}
              totalPages={sessionLeaderboardTable.totalPages}
            />
          </form>
        </section>

        <section className="space-y-4">
          <form method="get" action="/stats" className="glass rounded-2xl border border-white/10 p-4">
            <HiddenParams
              params={parsedParams}
              exclude={["visitPage", "visitQ", "visitCountry", "visitReferral"]}
            />
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-text-tertiary">
                Search
                <input
                  name="visitQ"
                  defaultValue={parsedParams.visitQ ?? ""}
                  placeholder="path, url, referrer, utm..."
                  className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2"
                />
              </label>
              <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-text-tertiary">
                Country
                <input
                  name="visitCountry"
                  defaultValue={parsedParams.visitCountry ?? ""}
                  placeholder="e.g. US"
                  className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2"
                />
              </label>
              <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-text-tertiary">
                Referral code
                <input
                  name="visitReferral"
                  defaultValue={parsedParams.visitReferral ?? ""}
                  placeholder="ref code"
                  className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2"
                />
              </label>
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[oklch(0.14_0.04_75)] hover:bg-accent-hover"
              >
                Apply
              </button>
              <Link
                href={withParams(parsedParams, {
                  visitPage: null,
                  visitQ: null,
                  visitCountry: null,
                  visitReferral: null,
                })}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary"
              >
                Clear
              </Link>
            </div>
            <DataTable
              title="website_visits"
              subtitle={`${visitsTable.total.toLocaleString()} rows total`}
              columns={visitsColumns}
              rows={visitsTable.rows}
            />
            <Pagination
              params={parsedParams}
              pageKey="visitPage"
              page={visitsTable.page}
              totalPages={visitsTable.totalPages}
            />
          </form>
        </section>

        <section className="space-y-4">
          <form method="get" action="/stats" className="glass rounded-2xl border border-white/10 p-4">
            <HiddenParams params={parsedParams} exclude={["refPage", "refQ", "refCountry", "refSource"]} />
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-text-tertiary">
                Search
                <input
                  name="refQ"
                  defaultValue={parsedParams.refQ ?? ""}
                  placeholder="code, name, ip, user agent..."
                  className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2"
                />
              </label>
              <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-text-tertiary">
                Country
                <input
                  name="refCountry"
                  defaultValue={parsedParams.refCountry ?? ""}
                  placeholder="e.g. DE"
                  className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2"
                />
              </label>
              <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-text-tertiary">
                Source
                <input
                  name="refSource"
                  defaultValue={parsedParams.refSource ?? ""}
                  placeholder="website"
                  className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2"
                />
              </label>
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[oklch(0.14_0.04_75)] hover:bg-accent-hover"
              >
                Apply
              </button>
              <Link
                href={withParams(parsedParams, {
                  refPage: null,
                  refQ: null,
                  refCountry: null,
                  refSource: null,
                })}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary"
              >
                Clear
              </Link>
            </div>
            <DataTable
              title="referrals"
              subtitle={`${referralsTable.total.toLocaleString()} rows total`}
              columns={referralsColumns}
              rows={referralsTable.rows}
            />
            <Pagination
              params={parsedParams}
              pageKey="refPage"
              page={referralsTable.page}
              totalPages={referralsTable.totalPages}
            />
          </form>
        </section>

        <section className="space-y-4">
          <form method="get" action="/stats" className="glass rounded-2xl border border-white/10 p-4">
            <HiddenParams
              params={parsedParams}
              exclude={["eventPage", "eventQ", "eventName", "eventCountry"]}
            />
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-text-tertiary">
                Search
                <input
                  name="eventQ"
                  defaultValue={parsedParams.eventQ ?? ""}
                  placeholder="href, path, referrer, user agent..."
                  className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2"
                />
              </label>
              <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-text-tertiary">
                Event name
                <input
                  name="eventName"
                  defaultValue={parsedParams.eventName ?? ""}
                  placeholder="cta_whatsapp_click"
                  className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2"
                />
              </label>
              <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-text-tertiary">
                Country
                <input
                  name="eventCountry"
                  defaultValue={parsedParams.eventCountry ?? ""}
                  placeholder="e.g. ET"
                  className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2"
                />
              </label>
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[oklch(0.14_0.04_75)] hover:bg-accent-hover"
              >
                Apply
              </button>
              <Link
                href={withParams(parsedParams, {
                  eventPage: null,
                  eventQ: null,
                  eventName: null,
                  eventCountry: null,
                })}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary"
              >
                Clear
              </Link>
            </div>
            <DataTable
              title="website_events"
              subtitle={`${eventsTable.total.toLocaleString()} rows total`}
              columns={eventsColumns}
              rows={eventsTable.rows}
            />
            <Pagination
              params={parsedParams}
              pageKey="eventPage"
              page={eventsTable.page}
              totalPages={eventsTable.totalPages}
            />
          </form>
        </section>
      </div>
    </main>
  );
}
