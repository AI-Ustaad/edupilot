// route-helpers/withRateLimit.ts
import { createApiResponse } from "@/lib/response/apiResponse";
import { cache } from "@/lib/cache/cache";

interface RateLimitOptions {
  windowMs?: number;      // milliseconds
  maxRequests?: number;   // max requests per window
}

export function withRateLimit(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute default
  const maxRequests = options.maxRequests || 30;   // 30 requests per minute

  return (handler: Function) => async (req: Request, context?: any) => {
    // Get client IP from headers
    const ip = req.headers.get("x-forwarded-for") || 
               req.headers.get("x-real-ip") || 
               "unknown";
    const key = `rate_limit:${ip}`;
    const now = Date.now();

    const current = cache.get<{ count: number; resetAt: number }>(key);

    if (!current) {
      cache.set(key, { count: 1, resetAt: now + windowMs }, windowMs / 1000);
    } else {
      if (now > current.resetAt) {
        cache.set(key, { count: 1, resetAt: now + windowMs }, windowMs / 1000);
      } else {
        if (current.count >= maxRequests) {
          return createApiResponse(429, null, "Too many requests. Please try again later.");
        }
        current.count++;
        cache.set(key, current, (current.resetAt - now) / 1000);
      }
    }

    return handler(req, context);
  };
}
