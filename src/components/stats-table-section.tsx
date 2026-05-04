"use client";

import { useEffect, useMemo, useState } from "react";

import { tableColumns, tableDefaults, type SortDir, type StatsTableKey } from "@/lib/stats-table-config";

type RowRecord = Record<string, unknown>;

type StatsTableResult = {
  rows: RowRecord[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  columns: readonly string[];
  sortBy: string;
  sortDir: SortDir;
};

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

function baseFilters(table: StatsTableKey) {
  return {
    page: 1,
    q: "",
    country: "",
    referral: "",
    source: "",
    eventName: "",
    month: "",
    dateFrom: "",
    dateTo: "",
    sortBy: tableDefaults[table].sortBy,
    sortDir: tableDefaults[table].sortDir,
  };
}

type SectionFilters = {
  page: number;
  q: string;
  country: string;
  referral: string;
  source: string;
  eventName: string;
  month: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortDir: SortDir;
};

function inputClass() {
  return "rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2";
}

export function StatsTableSection({
  table,
  title,
}: {
  table: StatsTableKey;
  title: string;
}) {
  const [filters, setFilters] = useState<SectionFilters>(baseFilters(table));
  const [data, setData] = useState<StatsTableResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns = useMemo(() => tableColumns[table], [table]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      const sp = new URLSearchParams();
      sp.set("table", table);
      Object.entries(filters).forEach(([k, v]) => {
        if (v === "" || v === null || v === undefined) return;
        sp.set(k, String(v));
      });

      try {
        const res = await fetch(`/api/stats/table?${sp.toString()}`, {
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load table data.");
        const payload = (await res.json()) as StatsTableResult;
        if (!cancelled) setData(payload);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load table data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [table, filters]);

  const setFilter = (next: Partial<SectionFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  };

  return (
    <section className="space-y-4">
      <div className="glass rounded-2xl border border-white/10 p-4">
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-text-tertiary">
            Search
            <input
              value={filters.q}
              onChange={(e) => setFilter({ q: e.target.value, page: 1 })}
              placeholder="Search..."
              className={inputClass()}
            />
          </label>

          {table === "visits" || table === "referrals" || table === "events" ? (
            <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-text-tertiary">
              Country
              <input
                value={filters.country}
                onChange={(e) => setFilter({ country: e.target.value, page: 1 })}
                placeholder="e.g. US"
                className={inputClass()}
              />
            </label>
          ) : null}

          {table === "visits" ? (
            <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-text-tertiary">
              Referral code
              <input
                value={filters.referral}
                onChange={(e) => setFilter({ referral: e.target.value, page: 1 })}
                placeholder="ref code"
                className={inputClass()}
              />
            </label>
          ) : null}

          {table === "referrals" ? (
            <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-text-tertiary">
              Source
              <input
                value={filters.source}
                onChange={(e) => setFilter({ source: e.target.value, page: 1 })}
                placeholder="website"
                className={inputClass()}
              />
            </label>
          ) : null}

          {table === "events" ? (
            <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-text-tertiary">
              Event name
              <input
                value={filters.eventName}
                onChange={(e) => setFilter({ eventName: e.target.value, page: 1 })}
                placeholder="cta_whatsapp_click"
                className={inputClass()}
              />
            </label>
          ) : null}

          <label className="flex min-w-44 flex-col gap-1 text-xs text-text-tertiary">
            Month
            <input
              type="month"
              value={filters.month}
              onChange={(e) => setFilter({ month: e.target.value, page: 1 })}
              className={inputClass()}
            />
          </label>
          <label className="flex min-w-44 flex-col gap-1 text-xs text-text-tertiary">
            Date from
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilter({ dateFrom: e.target.value, page: 1 })}
              className={inputClass()}
            />
          </label>
          <label className="flex min-w-44 flex-col gap-1 text-xs text-text-tertiary">
            Date to
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilter({ dateTo: e.target.value, page: 1 })}
              className={inputClass()}
            />
          </label>
          <button
            type="button"
            onClick={() => setFilters(baseFilters(table))}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary"
          >
            Clear
          </button>
        </div>

        <div className="glass overflow-hidden rounded-2xl border border-white/10">
          <div className="border-b border-white/10 px-4 py-3">
            <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
            <p className="mt-1 text-xs text-text-tertiary">
              {data ? `${data.total.toLocaleString()} rows total` : "Loading..."}
            </p>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.08em] text-text-tertiary">
                <tr>
                  {columns.map((column) => {
                    const active = data?.sortBy === column;
                    const current = data?.sortDir ?? filters.sortDir;
                    const nextDir: SortDir = active && current === "asc" ? "desc" : "asc";
                    const indicator = active ? (current === "asc" ? "↑" : "↓") : "";
                    return (
                      <th key={column} className="px-3 py-2 text-left whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setFilter({ sortBy: column, sortDir: nextDir, page: 1 })}
                          className="inline-flex items-center gap-1 hover:text-text-primary"
                        >
                          {prettyColumnName(column)}
                          <span className="text-[10px]">{indicator}</span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {error ? (
                  <tr>
                    <td colSpan={columns.length} className="px-3 py-6 text-center text-sm text-red-300">
                      {error}
                    </td>
                  </tr>
                ) : loading && !data ? (
                  <tr>
                    <td colSpan={columns.length} className="px-3 py-6 text-center text-sm text-text-tertiary">
                      Loading...
                    </td>
                  </tr>
                ) : data && data.rows.length ? (
                  data.rows.map((row, idx) => (
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
                    <td colSpan={columns.length} className="px-3 py-6 text-center text-sm text-text-tertiary">
                      No rows found for the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {data ? (
          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
            <p className="text-text-tertiary">
              Page {data.page} of {data.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={data.page <= 1}
                onClick={() => setFilter({ page: Math.max(1, data.page - 1) })}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-text-secondary hover:bg-white/5 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={data.page >= data.totalPages}
                onClick={() => setFilter({ page: Math.min(data.totalPages, data.page + 1) })}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-text-secondary hover:bg-white/5 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

