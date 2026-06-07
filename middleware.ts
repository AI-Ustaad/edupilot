// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";

const PUBLIC_PATHS = ["/login", "/signup", "/callback", "/", "/api/auth/login", "/api/auth/register-user", "/api/auth/parent-login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Public routes اور static files کو اجازت دیں
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Session Verify کریں
  const user = await getSessionUser();
  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
