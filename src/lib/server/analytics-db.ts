"use server";

import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

declare global {
  var __aklileSchemaReady: Promise<void> | undefined;
}

function getSql() {
  if (!dbUrl) {
    throw new Error(
      "Missing DATABASE_URL (or POSTGRES_URL). Add your Neon Postgres connection string.",
    );
  }
  return neon(dbUrl);
}

export async function ensureAnalyticsSchema() {
  if (!global.__aklileSchemaReady) {
    global.__aklileSchemaReady = (async () => {
      const sql = getSql();

      await sql`
        CREATE TABLE IF NOT EXISTS referrals (
          code TEXT PRIMARY KEY,
          referrer_name TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          created_by_visitor_id TEXT,
          created_by_session_id TEXT,
          created_ip TEXT,
          created_country TEXT,
          created_region TEXT,
          created_city TEXT,
          created_user_agent TEXT,
          source TEXT NOT NULL DEFAULT 'website'
        );
      `;

      await sql`
        ALTER TABLE referrals
        ADD COLUMN IF NOT EXISTS referrer_name TEXT;
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS website_visits (
          id BIGSERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          visitor_id TEXT,
          session_id TEXT,
          referral_code TEXT,
          path TEXT,
          full_url TEXT,
          referrer TEXT,
          method TEXT,
          user_agent TEXT,
          ip_address TEXT,
          country TEXT,
          region TEXT,
          city TEXT,
          latitude TEXT,
          longitude TEXT,
          timezone TEXT,
          utm_source TEXT,
          utm_medium TEXT,
          utm_campaign TEXT,
          utm_term TEXT,
          utm_content TEXT,
          query_string TEXT
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS website_events (
          id BIGSERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          event_name TEXT NOT NULL,
          event_location TEXT,
          href TEXT,
          path TEXT,
          full_url TEXT,
          referrer TEXT,
          visitor_id TEXT,
          session_id TEXT,
          referral_code TEXT,
          user_agent TEXT,
          ip_address TEXT,
          country TEXT,
          region TEXT,
          city TEXT,
          timezone TEXT,
          metadata JSONB
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS website_sessions (
          session_id TEXT PRIMARY KEY,
          visitor_id TEXT,
          referral_code TEXT,
          first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          active_ms_total BIGINT NOT NULL DEFAULT 0,
          visit_count INTEGER NOT NULL DEFAULT 0,
          country TEXT,
          region TEXT,
          city TEXT,
          timezone TEXT
        );
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_website_visits_created_at
          ON website_visits (created_at DESC);
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_website_visits_visitor_id
          ON website_visits (visitor_id);
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_website_visits_session_id
          ON website_visits (session_id);
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_website_visits_referral_code
          ON website_visits (referral_code);
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_website_events_created_at
          ON website_events (created_at DESC);
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_website_events_event_name
          ON website_events (event_name);
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_website_events_visitor_id
          ON website_events (visitor_id);
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_website_events_referral_code
          ON website_events (referral_code);
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_website_sessions_last_seen_at
          ON website_sessions (last_seen_at DESC);
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_website_sessions_visit_count
          ON website_sessions (visit_count DESC);
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_website_sessions_active_ms_total
          ON website_sessions (active_ms_total DESC);
      `;
    })();
  }

  await global.__aklileSchemaReady;
}

export function db() {
  return getSql();
}
