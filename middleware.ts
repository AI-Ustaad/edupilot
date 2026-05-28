import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// next-intl کا مڈل ویئر
const intlMiddleware = createMiddleware({
  locales: ["en", "ur"],
  defaultLocale: "en",
});

export default async function middleware(req: NextRequest) {
  // 1. پہلے زبان کا تعین کریں
  const intlResponse = await intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // 2. سیکیورٹی چیک
  const session = req.cookies.get("session")?.value;
  const { pathname } = req.nextUrl;

  // عوامی راستے (بغیر لاگ ان)
  const isPublicPath =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/" ||
    pathname === "/callback" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  // API راستوں کو نظر انداز کریں
  const isApiRoute = pathname.startsWith("/api");

  if (!session && !isPublicPath && !isApiRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|sw.js|icons|images|assets|manifest.json).*)"],
};
