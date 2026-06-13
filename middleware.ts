// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Public routes that do NOT require a session
const PUBLIC_PATHS = [
  "/", 
  "/login", 
  "/signup", 
  "/callback", 
  "/onboarding",
  "/api/auth/login", 
  "/api/auth/register-user", 
  "/api/auth/parent-login",
  "/api/v1/auth/login",         // ✅ نیا - Login API
  "/api/v1/auth/register-user", // ✅ نیا
  "/api/v1/auth/parent-login",  // ✅ نیا
  "/api/stripe/webhook"
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public routes, static assets, and API auth routes
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/v1/auth") ||  // ✅ نیا - تمام auth APIs
    pathname.includes(".") // static files like .png, .css
  ) {
    return NextResponse.next();
  }

  // 2. Check if the session cookie exists.
  const sessionCookie = req.cookies.get("session");
  
  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
