// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1. Redis client صرف تب بنائیں اگر ویریبلز موجود ہوں
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// 2. ریئل Ratelimit instances (یا null)
const _authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),  // 5 req/min
      prefix: "edupilot:auth",
    })
  : null;

const _aiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 req/min
      prefix: "edupilot:ai",
    })
  : null;

const _standardLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"), // 30 req/min
      prefix: "edupilot:standard",
    })
  : null;

// 3. ڈمی limiter (جب Redis نہ ہو) – یہ withRateLimit کو خوش رکھتا ہے
const dummyLimiter = {
  limit: async () => ({ success: true, reset: 0 }),
};

// 4. exports – ہمیشہ ایک قابل استعمال limiter آبجیکٹ برآمد کریں
export const authLimiter = _authLimiter ?? dummyLimiter;
export const aiLimiter = _aiLimiter ?? dummyLimiter;
export const standardLimiter = _standardLimiter ?? dummyLimiter;

// 5. لاگ ان API کے لیے علیحدہ فنکشن (براہ راست استعمال)
export async function checkAuthRateLimit() {
  return authLimiter.limit("login");
}
