// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash Redis کنکشن
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// سخت لمٹ (مثلاً لاگ ان کے لیے)
export const strictRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"), // 15 منٹ میں 10 کوششیں
  analytics: true,
  prefix: "ratelimit:strict",
});

// عام لمٹ (زیادہ تر APIs کے لیے)
export const standardRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"), // 1 منٹ میں 30 درخواستیں
  analytics: true,
  prefix: "ratelimit:standard",
});
