// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Redis client صرف تب بنائیں جب ویریبلز موجود ہوں
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// ڈمی limiter – ہمیشہ اجازت دیتا ہے
const dummyLimiter = {
  limit: async () => ({ success: true, reset: 0 }),
};

// حقیقی Ratelimit instances (اگر Redis موجود ہو)
const _authLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "60 s"), prefix: "edupilot:auth" })
  : dummyLimiter;

const _aiLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "60 s"), prefix: "edupilot:ai" })
  : dummyLimiter;

const _standardLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "60 s"), prefix: "edupilot:standard" })
  : dummyLimiter;

// ─── Exports (مطلوبہ ناموں کے ساتھ) ──────────────────────────────
export const aiRateLimit = _aiLimiter;
export const authRateLimit = _authLimiter;
export const standardRateLimit = _standardLimiter;

// لاگ ان API میں استعمال ہونے والا فنکشن
export async function checkAuthRateLimit() {
  return _authLimiter.limit("login");
}
