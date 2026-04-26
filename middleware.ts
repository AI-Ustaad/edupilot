import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = ["/login", "/callback", "/signup"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check session cookie
  const session = req.cookies.get("session")?.value;

  // If no session → redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If logged in → allow access
  return NextResponse.next();
}

// Apply middleware only on these routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/students/:path*",
    "/attendance/:path*",
    "/staff/:path*",
    "/fees/:path*",
    "/classes/:path*",
    "/timetable/:path*",
    "/settings/:path*",
  ],
};
