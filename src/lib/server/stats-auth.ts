import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const STATS_COOKIE = "akl_stats_auth";
const STATS_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function getSecret() {
  return process.env.STATS_SESSION_SECRET ?? process.env.DATABASE_URL ?? "akl-stats-secret";
}

export function getStatsPassword() {
  return process.env.STATS_DASHBOARD_PASSWORD ?? process.env.STATS_PASSWORD ?? "";
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function createStatsSessionValue() {
  const expiresAt = Math.floor(Date.now() / 1000) + STATS_SESSION_MAX_AGE_SECONDS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

export function verifyStatsSessionValue(value: string | undefined) {
  if (!value) return false;
  const [expiresAtRaw, mac] = value.split(".");
  if (!expiresAtRaw || !mac) return false;
  const expected = sign(expiresAtRaw);
  if (!safeEqual(expected, mac)) return false;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt)) return false;
  return expiresAt > Math.floor(Date.now() / 1000);
}

export async function isStatsAuthenticated() {
  const jar = await cookies();
  const token = jar.get(STATS_COOKIE)?.value;
  return verifyStatsSessionValue(token);
}

export function statsCookieName() {
  return STATS_COOKIE;
}

export function statsSessionMaxAgeSeconds() {
  return STATS_SESSION_MAX_AGE_SECONDS;
}
