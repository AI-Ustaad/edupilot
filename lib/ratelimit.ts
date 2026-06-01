// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// اپنی Upstash Redis ڈیٹابیس سے کنکشن بنائیں
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// مختلف حالات کے لیے مختلف لیمیٹرز بنا سکتے ہیں
export const strictRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),  // 1 منٹ میں زیادہ سے زیادہ 5 درخواستیں
  analytics: true,
  prefix: "ratelimit:strict",
});

export const standardRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"), // 1 منٹ میں 30 درخواستیں
  analytics: true,
  prefix: "ratelimit:standard",
});

export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"), // 15 منٹ میں 10 کوششیں (بروٹ فورس روکنے کے لیے)
  analytics: true,
  prefix: "ratelimit:login",
});

// عام استعمال کے لیے مددگار فنکشن (rate limiter object واپس کرتا ہے)
// آپ مڈل ویئر میں براہِ راست limiter استعمال کریں گے
