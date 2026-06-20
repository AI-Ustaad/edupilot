// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// صرف تب Redis کلائنٹ بنائیں جب ویریبلز موجود ہوں
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// اگر Redis موجود ہو تو Ratelimit بنائیں، ورنہ null
const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "edupilot:auth",
    })
  : null;

export async function checkAuthRateLimit() {
  // اگر Ratelimit دستیاب نہ ہو (Redis کنفیگر نہیں)، تو ہمیشہ کامیاب سمجھیں
  if (!ratelimit) {
    console.warn("Rate limiter not configured – allowing request");
    return { success: true, reset: 0 };
  }

  try {
    const result = await ratelimit.limit("auth");
    return { success: result.success, reset: result.reset };
  } catch (error) {
    // Redis میں کوئی مسئلہ ہو تو بھی بلاک نہ کریں – صرف رپورٹ کریں
    console.error("Rate limit check failed, allowing by default:", error);
    return { success: true, reset: 0 };
  }
}
