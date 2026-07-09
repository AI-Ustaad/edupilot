// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger/logger";

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

function createLimiter(max: number, prefix: string): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, "60 s"),
    prefix,
  });
}

export const aiRateLimit = createLimiter(10, "edupilot:ai");
export const authRateLimit = createLimiter(5, "edupilot:auth");
export const standardRateLimit = createLimiter(30, "edupilot:standard");

// لاگ ان API کے لیے فنکشن (اگر limiter نہ ہو تو ہمیشہ کامیاب)
export async function checkAuthRateLimit() {
  if (!authRateLimit) return { success: true, reset: 0 };
  try {
    const result = await authRateLimit.limit("login");
    return { success: result.success, reset: result.reset };
  } catch (error) {
    logger.error("Rate limiter error:", { metadata: { error } });
    return { success: true, reset: 0 };
  }
}
