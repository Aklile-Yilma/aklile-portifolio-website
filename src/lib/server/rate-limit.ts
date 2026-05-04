type Bucket = {
  count: number;
  resetAt: number;
};

declare global {
  var __aklileRateLimitStore: Map<string, Bucket> | undefined;
}

function store() {
  if (!global.__aklileRateLimitStore) {
    global.__aklileRateLimitStore = new Map<string, Bucket>();
  }
  return global.__aklileRateLimitStore;
}

export function consumeRateLimit(input: {
  key: string;
  max: number;
  windowMs: number;
}) {
  const now = Date.now();
  const s = store();
  const current = s.get(input.key);

  if (!current || current.resetAt <= now) {
    const next: Bucket = { count: 1, resetAt: now + input.windowMs };
    s.set(input.key, next);
    return { allowed: true, remaining: input.max - 1, resetAt: next.resetAt };
  }

  if (current.count >= input.max) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  s.set(input.key, current);
  return {
    allowed: true,
    remaining: Math.max(0, input.max - current.count),
    resetAt: current.resetAt,
  };
}
