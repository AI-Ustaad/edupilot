// route-helpers/withRateLimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import { apiRateLimit } from "@/lib/ratelimit";

export function withRateLimit(limiter: Ratelimit = apiRateLimit) {
  return (handler: Function) => {
    return async (req: Request, context: any) => {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "anonymous";

      const { success } = await limiter.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many requests. Please try again later.",
          },
          { status: 429 }
        );
      }

      return handler(req, context);
    };
  };
}
