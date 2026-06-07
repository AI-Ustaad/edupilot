import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

// Initialize Upstash Redis from Environment Variables
const redis = Redis.fromEnv();

// ==========================================
// 1. AUTH RATE LIMIT (Strict - 10 req/min)
// For login/signup routes to prevent brute force
// ==========================================
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

// ==========================================
// 2. AI RATE LIMIT (Medium - 20 req/min)
// For AI routes (chatbot, exam questions) to control costs
// ==========================================
export const aiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
});

// ==========================================
// 3. STANDARD RATE LIMIT (Relaxed - 60 req/min)
// For general API routes (dashboard, fees, staff)
// ==========================================
export const standardRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================
export async function checkAuthRateLimit() {
  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
  const { success, limit, reset, remaining } = await authRateLimit.limit(`auth_${ip}`);
  return { success, limit, reset, remaining };
}

export async function checkAiRateLimit() {
  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
  const { success, limit, reset, remaining } = await aiRateLimit.limit(`ai_${ip}`);
  return { success, limit, reset, remaining };
}

export async function checkStandardRateLimit() {
  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
  const { success, limit, reset, remaining } = await standardRateLimit.limit(`standard_${ip}`);
  return { success, limit, reset, remaining };
}
