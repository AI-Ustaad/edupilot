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

function getAuthLimiter(): Ratelimit | null {
  if (authRateLimit) return authRateLimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    if (!redis) {
      redis = new Redis({ url, token });
    }
    return createLimiter(5, "edupilot:auth");
  }
  return null;
}

// لاگ ان API کے لیے فنکشن: فی کلائنٹ IP ریٹ لمٹ (تاکہ گلوبل لاک آؤٹ نہ ہو)
export async function checkAuthRateLimit(identifier?: string | Request) {
  const limiter = getAuthLimiter();
  if (!limiter) return { success: true, reset: 0 };
  try {
    let clientIp = "anonymous";
    if (typeof identifier === "string" && identifier.trim()) {
      clientIp = identifier.trim();
    } else if (identifier && typeof identifier === "object" && "headers" in identifier) {
      const forwarded = identifier.headers.get("x-forwarded-for");
      const realIp = identifier.headers.get("x-real-ip");
      clientIp = (forwarded?.split(",")[0] || realIp || "anonymous").trim();
    }
    // Sanitize identifier to prevent injection or malformed keys
    const safeKey = clientIp.replace(/[^a-zA-Z0-9.:_-]/g, "_");
    const result = await limiter.limit(`login:${safeKey}`);
    return { success: result.success, reset: result.reset };
  } catch (error) {
    logger.error("Rate limiter error:", { metadata: { error } });
    return { success: true, reset: 0 };
  }
}
