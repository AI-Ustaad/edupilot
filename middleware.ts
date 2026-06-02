import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// 1. Set up next‑intl middleware
const intlMiddleware = createMiddleware({
  locales: ["en", "ur", "ar", "hi", "es", "fr", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed",   // no prefix for default language
});

// 2. A simple function that returns true for public (non‑protected) pages
function isPublicPath(pathname: string) {
  const publicPages = ["/login", "/signup", "/callback"];

  // Exact root
  if (pathname === "/") return true;

  // Bare paths (e.g., /login)
  if (publicPages.some(p => pathname.startsWith(p))) return true;

  // Locale‑prefixed versions (e.g., /ur/login)
  const locales = ["en", "ur", "ar", "hi", "es", "fr", "zh"];
  return locales.some(locale =>
    publicPages.some(p => pathname.startsWith(`/${locale}${p}`))
  );
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // If the request is for a public page, just let next‑intl handle the locale
  if (isPublicPath(pathname)) {
    return intlMiddleware(req);
  }

  // API routes have their own authentication – skip session check
  if (pathname.startsWith("/api")) {
    return intlMiddleware(req);
  }

  // Protected routes: require a session cookie
  const session = req.cookies.get("session")?.value;
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allowed – let the request continue with locale handling
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
