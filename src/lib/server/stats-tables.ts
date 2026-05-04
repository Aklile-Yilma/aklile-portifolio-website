import { db, ensureAnalyticsSchema } from "@/lib/server/analytics-db";
import { tableColumns, tableDefaults, type SortDir, type StatsTableKey } from "@/lib/stats-table-config";

const PAGE_SIZE = 20;

type RowRecord = Record<string, unknown>;

export type StatsTableResult = {
  rows: RowRecord[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  columns: readonly string[];
  sortBy: string;
  sortDir: SortDir;
};

function num(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function asPage(v: string | undefined) {
  const parsed = Number(v);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function asIsoDate(v: string | undefined): string | null {
  if (!v) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

function monthRange(v: string | undefined) {
  if (!v || !/^\d{4}-\d{2}$/.test(v)) return { start: null, endExclusive: null };
  const [yRaw, mRaw] = v.split("-");
  const y = Number(yRaw);
  const m = Number(mRaw);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    return { start: null, endExclusive: null };
  }
  const start = `${yRaw}-${mRaw}-01`;
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  const endExclusive = `${nextY}-${String(nextM).padStart(2, "0")}-01`;
  return { start, endExclusive };
}

function asSortDir(v: string | undefined): SortDir {
  return v === "asc" ? "asc" : "desc";
}

function asSortColumn(table: StatsTableKey, value: string | undefined): string {
  const allowed = tableColumns[table] as readonly string[];
  const fallback = tableDefaults[table].sortBy;
  if (!value) return fallback;
  return allowed.includes(value) ? value : fallback;
}

export async function getStatsTableData(
  table: StatsTableKey,
  input: Record<string, string | undefined>,
): Promise<StatsTableResult> {
  await ensureAnalyticsSchema();
  const sql = db();

  const q = (input.q ?? "").trim();
  const country = (input.country ?? "").trim();
  const referral = (input.referral ?? "").trim();
  const source = (input.source ?? "").trim();
  const eventName = (input.eventName ?? "").trim();
  const dateFrom = asIsoDate(input.dateFrom);
  const dateTo = asIsoDate(input.dateTo);
  const month = monthRange(input.month);
  const sortBy = asSortColumn(table, input.sortBy);
  const sortDir = asSortDir(input.sortDir);
  const orderSql = `${sortBy} ${sortDir === "asc" ? "ASC" : "DESC"} NULLS LAST`;
  const pageRequested = asPage(input.page);

  const qLike = `%${q}%`;
  const countryLike = `%${country}%`;
  const referralLike = `%${referral}%`;
  const sourceLike = `%${source}%`;
  const eventLike = `%${eventName}%`;

  if (table === "visits") {
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
          COALESCE(query_string, '')
        ) ILIKE ${qLike})
        AND (${country} = '' OR COALESCE(country, '') ILIKE ${countryLike})
        AND (${referral} = '' OR COALESCE(referral_code, '') ILIKE ${referralLike})
        AND (${dateFrom}::date IS NULL OR created_at >= ${dateFrom}::date)
        AND (${dateTo}::date IS NULL OR created_at < (${dateTo}::date + INTERVAL '1 day'))
        AND (${month.start}::date IS NULL OR (created_at >= ${month.start}::date AND created_at < ${month.endExclusive}::date));
    `;
    const total = num((countRow as { count?: string | number }).count);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(1, pageRequested), totalPages);
    const offset = (page - 1) * PAGE_SIZE;
    const rows = await sql`
      SELECT
        id, created_at, visitor_id, session_id, referral_code, path, full_url, referrer,
        method, user_agent, ip_address, country, region, city, latitude, longitude, timezone, query_string
      FROM website_visits
      WHERE
        (${q} = '' OR CONCAT_WS(
          ' ',
          COALESCE(path, ''),
          COALESCE(full_url, ''),
          COALESCE(referrer, ''),
          COALESCE(user_agent, ''),
          COALESCE(ip_address, ''),
          COALESCE(query_string, '')
        ) ILIKE ${qLike})
        AND (${country} = '' OR COALESCE(country, '') ILIKE ${countryLike})
        AND (${referral} = '' OR COALESCE(referral_code, '') ILIKE ${referralLike})
        AND (${dateFrom}::date IS NULL OR created_at >= ${dateFrom}::date)
        AND (${dateTo}::date IS NULL OR created_at < (${dateTo}::date + INTERVAL '1 day'))
        AND (${month.start}::date IS NULL OR (created_at >= ${month.start}::date AND created_at < ${month.endExclusive}::date))
      ORDER BY ${sql.unsafe(orderSql)}, id DESC
      LIMIT ${PAGE_SIZE}
      OFFSET ${offset};
    `;
    return { rows: rows as RowRecord[], total, page, totalPages, pageSize: PAGE_SIZE, columns: tableColumns.visits, sortBy, sortDir };
  }

  if (table === "referrals") {
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
        AND (${source} = '' OR COALESCE(source, '') ILIKE ${sourceLike})
        AND (${dateFrom}::date IS NULL OR created_at >= ${dateFrom}::date)
        AND (${dateTo}::date IS NULL OR created_at < (${dateTo}::date + INTERVAL '1 day'))
        AND (${month.start}::date IS NULL OR (created_at >= ${month.start}::date AND created_at < ${month.endExclusive}::date));
    `;
    const total = num((countRow as { count?: string | number }).count);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(1, pageRequested), totalPages);
    const offset = (page - 1) * PAGE_SIZE;
    const rows = await sql`
      SELECT
        code, referrer_name, created_at, created_by_visitor_id, created_by_session_id,
        created_ip, created_country, created_region, created_city, created_user_agent, source
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
        AND (${dateFrom}::date IS NULL OR created_at >= ${dateFrom}::date)
        AND (${dateTo}::date IS NULL OR created_at < (${dateTo}::date + INTERVAL '1 day'))
        AND (${month.start}::date IS NULL OR (created_at >= ${month.start}::date AND created_at < ${month.endExclusive}::date))
      ORDER BY ${sql.unsafe(orderSql)}, code DESC
      LIMIT ${PAGE_SIZE}
      OFFSET ${offset};
    `;
    return { rows: rows as RowRecord[], total, page, totalPages, pageSize: PAGE_SIZE, columns: tableColumns.referrals, sortBy, sortDir };
  }

  if (table === "events") {
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
        AND (${country} = '' OR COALESCE(country, '') ILIKE ${countryLike})
        AND (${dateFrom}::date IS NULL OR created_at >= ${dateFrom}::date)
        AND (${dateTo}::date IS NULL OR created_at < (${dateTo}::date + INTERVAL '1 day'))
        AND (${month.start}::date IS NULL OR (created_at >= ${month.start}::date AND created_at < ${month.endExclusive}::date));
    `;
    const total = num((countRow as { count?: string | number }).count);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(1, pageRequested), totalPages);
    const offset = (page - 1) * PAGE_SIZE;
    const rows = await sql`
      SELECT
        id, created_at, event_name, event_location, href, path, full_url, referrer, visitor_id,
        session_id, referral_code, user_agent, ip_address, country, region, city, timezone, metadata
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
        AND (${dateFrom}::date IS NULL OR created_at >= ${dateFrom}::date)
        AND (${dateTo}::date IS NULL OR created_at < (${dateTo}::date + INTERVAL '1 day'))
        AND (${month.start}::date IS NULL OR (created_at >= ${month.start}::date AND created_at < ${month.endExclusive}::date))
      ORDER BY ${sql.unsafe(orderSql)}, id DESC
      LIMIT ${PAGE_SIZE}
      OFFSET ${offset};
    `;
    return { rows: rows as RowRecord[], total, page, totalPages, pageSize: PAGE_SIZE, columns: tableColumns.events, sortBy, sortDir };
  }

  const [countRow = {}] = await sql`
    SELECT COUNT(*) AS count
    FROM website_sessions s
    WHERE
      (${q} = '' OR CONCAT_WS(
        ' ',
        COALESCE(s.session_id, ''),
        COALESCE(s.visitor_id, ''),
        COALESCE(s.referral_code, ''),
        COALESCE(s.country, '')
      ) ILIKE ${qLike})
      AND (${dateFrom}::date IS NULL OR s.last_seen_at >= ${dateFrom}::date)
      AND (${dateTo}::date IS NULL OR s.last_seen_at < (${dateTo}::date + INTERVAL '1 day'))
      AND (${month.start}::date IS NULL OR (s.last_seen_at >= ${month.start}::date AND s.last_seen_at < ${month.endExclusive}::date));
  `;
  const total = num((countRow as { count?: string | number }).count);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, pageRequested), totalPages);
  const offset = (page - 1) * PAGE_SIZE;
  const rows = await sql`
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
      AND (${dateFrom}::date IS NULL OR s.last_seen_at >= ${dateFrom}::date)
      AND (${dateTo}::date IS NULL OR s.last_seen_at < (${dateTo}::date + INTERVAL '1 day'))
      AND (${month.start}::date IS NULL OR (s.last_seen_at >= ${month.start}::date AND s.last_seen_at < ${month.endExclusive}::date))
    ORDER BY ${sql.unsafe(orderSql)}, s.last_seen_at DESC
    LIMIT ${PAGE_SIZE}
    OFFSET ${offset};
  `;
  return { rows: rows as RowRecord[], total, page, totalPages, pageSize: PAGE_SIZE, columns: tableColumns.sessions, sortBy, sortDir };
}

