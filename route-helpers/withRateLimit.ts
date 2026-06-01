// route-helpers/withRateLimit.ts
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Higher-order function that applies rate limiting using a given Ratelimit instance.
 * @param limiter - Upstash Ratelimit instance
 * @param identifier - (optional) how to identify the client, default is IP
 */
export function withRateLimit(limiter: Ratelimit, identifier?: (req: Request) => string) {
  return (handler: Function) => {
    return async (req: Request, context: any) => {
      // حقیقی IP حاصل کرنے کی کوشش کریں (Vercel کے x-forwarded-for ہیڈر سے)
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "anonymous";

      const key = identifier ? identifier(req) : ip;

      const { success, limit, remaining, reset } = await limiter.limit(key);

      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }

      // اصل ہینڈلر کو بلائیں
      return handler(req, context);
    };
  };
}
