import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("session")?.value;

  // public routes (no auth required)
  const publicRoutes = ["/login", "/callback"];

  if (!session && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

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
    "/setup/:path*",
  ],
};
