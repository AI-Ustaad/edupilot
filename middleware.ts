import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "ur", "ar", "hi", "es", "fr", "zh"],
  defaultLocale: "en",
});

export default async function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const { pathname } = req.nextUrl;

  // عوامی راستوں کی فہرست – اصل اور لوکیل والے دونوں
  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/login") ||            // /login
    pathname.startsWith("/signup") ||           // /signup
    pathname.startsWith("/callback") ||         // /callback
    ["en", "ur", "ar", "hi", "es", "fr", "zh"].some(
      (locale) =>
        pathname.startsWith(`/${locale}/login`) ||
        pathname.startsWith(`/${locale}/signup`) ||
        pathname.startsWith(`/${locale}/callback`)
    );

  const isApiRoute = pathname.startsWith("/api");

  if (!session && !isPublicPath && !isApiRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
