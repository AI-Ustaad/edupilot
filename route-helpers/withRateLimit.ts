// route-helpers/withRateLimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger/logger";

export function withRateLimit(limiter: Ratelimit | null) {
  return (handler: Function) => {
    return async (req: Request, context: any) => {
      // اگر کوئی limiter نہیں ہے تو بغیر چیک کے آگے بڑھیں
      if (!limiter) {
        return handler(req, context);
      }

      try {
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const result = await limiter.limit(ip);
        if (!result.success) {
          return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
          );
        }
        return handler(req, context);
      } catch (error) {
        logger.error("Rate limiter error, bypassing:", { metadata: { error } });
        return handler(req, context);
      }
    };
  };
}
