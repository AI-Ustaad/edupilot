import { NextRequest, NextResponse } from "next/server";
import { verifyEdgeSession } from "./lib/auth/edge-session";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/callback",
  "/onboarding",
  "/api/auth/login",
  "/api/auth/register-user",
  "/api/auth/parent-login",
  "/api/v1/auth/login",
  "/api/v1/auth/register-user",
  "/api/v1/auth/parent-login",
  "/api/v1/auth/session",
  "/api/v1/auth/logout",
  "/api/v1/stripe/webhook",
  "/api/webhooks/qstash",
  "/api/health",
];

const PUBLIC_PREFIXES = [
  "/_next",
  "/api/auth/login",
  "/api/auth/register-user",
  "/api/auth/parent-login",
  "/api/v1/auth/login",
  "/api/v1/auth/register-user",
  "/api/v1/auth/parent-login",
  "/api/v1/auth/session",
  "/api/v1/auth/logout",
];

/**
 * Dedicated machine-to-machine endpoints (cron schedules, background workers).
 *
 * These endpoints authenticate via machine secrets/signatures directly
 * in their route handlers and do NOT use browser session cookies.
 *
 * IMPORTANT: These paths are not public application endpoints. The
 * middleware simply does not require a browser Firebase session for them.
 */
const MACHINE_PATHS = [
  "/api/v1/cron/fee-reminder",
  "/api/v1/jobs/attendance-report",
  "/api/v1/jobs/fee-reminder",
  "/api/v1/jobs/events",
];

function unauthenticated(req: NextRequest, pathname: string) {
  // API consumers get a JSON 401; page navigations get a login redirect.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    MACHINE_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("session")?.value;

  // SECURITY FIX (Phase 1): verify the session JWT's signature and claims
  // at the Edge instead of trusting cookie presence alone. Previously a
  // forged or expired cookie value passed this gate; now only a genuinely
  // signed, unexpired Firebase token for this project is accepted.
  const session = await verifyEdgeSession(sessionCookie);

  if (!session) {
    return unauthenticated(req, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
