import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

describe("Middleware - Machine Authentication and Route Protection", () => {
  it("allows machine cron/jobs endpoints through without a browser session cookie", () => {
    const machineEndpoints = [
      "/api/v1/cron/fee-reminder",
      "/api/v1/jobs/attendance-report",
      "/api/v1/jobs/fee-reminder",
      "/api/v1/jobs/events",
    ];

    for (const pathname of machineEndpoints) {
      const req = new NextRequest(new URL(pathname, "http://localhost"));
      // Notice: NO session cookie attached
      const res = middleware(req);

      // Must allow request to proceed (status 200 / next()), NOT redirect to /login
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    }
  });

  it("returns 401 JSON for unauthenticated requests to protected API endpoints", () => {
    const protectedApiEndpoints = [
      "/api/v1/students",
      "/api/v1/fees",
      "/api/v1/jobs/job_12345", // User polling endpoint
    ];

    for (const pathname of protectedApiEndpoints) {
      const req = new NextRequest(new URL(pathname, "http://localhost"));
      // No session cookie
      const res = middleware(req);

      // Must NOT redirect to HTML /login
      expect(res.headers.get("location")).toBeNull();
      // Must return 401 JSON
      expect(res.status).toBe(401);
    }
  });

  it("redirects unauthenticated browser page visits to /login", () => {
    const protectedPages = [
      "/dashboard",
      "/admin/analytics",
      "/teacher/dashboard",
    ];

    for (const pathname of protectedPages) {
      const req = new NextRequest(new URL(pathname, "http://localhost"));
      const res = middleware(req);

      expect(res.status).toBe(307);
      const redirectUrl = res.headers.get("location");
      expect(redirectUrl).toContain("/login");
      expect(redirectUrl).toContain(`redirect=${encodeURIComponent(pathname)}`);
    }
  });

  it("allows public endpoints through without authentication", () => {
    const publicPaths = [
      "/login",
      "/api/v1/auth/login",
      "/api/v1/stripe/webhook",
      "/api/webhooks/qstash",
      "/api/health",
    ];

    for (const pathname of publicPaths) {
      const req = new NextRequest(new URL(pathname, "http://localhost"));
      const res = middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    }
  });
});
