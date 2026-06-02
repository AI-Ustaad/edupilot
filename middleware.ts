import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "ur", "ar", "hi", "es", "fr", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

function isPublicPath(pathname: string) {
  const publicPages = ["/login", "/signup", "/callback"];
  if (pathname === "/") return true;
  if (publicPages.some(p => pathname.startsWith(p))) return true;
  const locales = ["en", "ur", "ar", "hi", "es", "fr", "zh"];
  return locales.some(locale =>
    publicPages.some(p => pathname.startsWith(`/${locale}${p}`))
  );
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return intlMiddleware(req);
  }

  if (pathname.startsWith("/api")) {
    return intlMiddleware(req);
  }

  const session = req.cookies.get("session")?.value;
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
