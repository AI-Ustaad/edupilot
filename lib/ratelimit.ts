import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

// Initialize Upstash Redis from Environment Variables
const redis = Redis.fromEnv();

// 🛡️ Configure: 10 requests per 1 minute (Sliding Window)
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export async function checkAuthRateLimit() {
  const headersList = headers();
  // Get IP address (handles Vercel/Cloudflare proxies)
  const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
  
  const { success, limit, reset, remaining } = await authRateLimit.limit(`auth_${ip}`);
  
  return { success, limit, reset, remaining };
}
