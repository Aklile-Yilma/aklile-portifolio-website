import { db, ensureAnalyticsSchema } from "@/lib/server/analytics-db";
import { getStatsPassword, isStatsAuthenticated } from "@/lib/server/stats-auth";
import { StatsTableSection } from "@/components/stats-table-section";

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
  const error = typeof params?.error === "string" ? params.error : undefined;
  const statsPasswordExists = Boolean(getStatsPassword());

  const authed = await isStatsAuthenticated();
  if (!authed) return <LoginForm error={statsPasswordExists ? error : "missing_password"} />;

  let data: DashboardData | null = null;
  let dataError: string | null = null;

  try {
    data = await getDashboardData();
  } catch (err) {
    dataError = err instanceof Error ? err.message : "Failed to load stats.";
  }

  if (!data || dataError) {
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

        <StatsTableSection table="sessions" title="session_leaderboard" />
        <StatsTableSection table="visits" title="website_visits" />
        <StatsTableSection table="referrals" title="referrals" />
        <StatsTableSection table="events" title="website_events" />
      </div>
    </main>
  );
}
