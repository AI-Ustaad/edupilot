import { crypto } from "crypto";

export interface RequestContext {
  requestId: string;
  traceId: string | null;
  spanId: string | null;
  ip: string;
  userAgent: string;
  referer: string;
  origin: string;
  requestTime: string;
}

export const buildRequestContext = (req: Request): RequestContext => {
  return {
    requestId: req.headers.get("x-request-id") || req.headers.get("x-vercel-id") || crypto.randomUUID(),
    traceId: req.headers.get("x-b3-traceid") || req.headers.get("traceparent") || null,
    spanId: req.headers.get("x-b3-spanid") || null,
    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
    userAgent: req.headers.get("user-agent") || "unknown",
    referer: req.headers.get("referer") || "unknown",
    origin: req.headers.get("origin") || "unknown",
    requestTime: new Date().toISOString(),
  };
};
