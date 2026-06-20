// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Redis client صرف اس صورت میں بنائیں جب ضروری environment variables موجود ہوں
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// مختلف limiters جن کی مختلف حدود ہو سکتی ہیں (اگر Redis موجود ہے)
const authLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "60 s"), prefix: "auth" })
  : null;

const aiLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "60 s"), prefix: "ai" })
  : null;

const standardLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "60 s"), prefix: "standard" })
  : null;

// تمام فنکشنز fail-open ہیں – اگر Redis نہ ہو تو ہمیشہ اجازت دیں
async function safeLimit(limiter: Ratelimit | null): Promise<{ success: boolean; reset: number }> {
  if (!limiter) return { success: true, reset: 0 };
  try {
    const result = await limiter.limit("key");
    return { success: result.success, reset: result.reset };
  } catch (error) {
    console.error("Rate limiter error, allowing request:", error);
    return { success: true, reset: 0 };
  }
}

export async function checkAuthRateLimit() {
  return safeLimit(authLimiter);
}

export async function aiRateLimit() {
  return safeLimit(aiLimiter);
}

export async function authRateLimit() {
  return safeLimit(authLimiter);
}

export async function standardRateLimit() {
  return safeLimit(standardLimiter);
}
