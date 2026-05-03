"use server";

import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

declare global {
  // eslint-disable-next-line no-var
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
    })();
  }

  await global.__aklileSchemaReady;
}

export function db() {
  return getSql();
}
