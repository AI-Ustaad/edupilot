import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// next‑intl مڈل ویئر تیار کریں
const intlMiddleware = createMiddleware({
  locales: ["en", "ur", "ar", "hi", "es", "fr", "zh"],
  defaultLocale: "en",
});

export default async function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const { pathname } = req.nextUrl;

  // عوامی راستے
  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/callback");

  // API راستے – ان پر سیشن چیک نہ کریں
  const isApiRoute = pathname.startsWith("/api");

  // اگر سیشن نہیں ہے اور راستہ نہ عوامی ہے نہ API، تو لاگ ان پر بھیجیں
  if (!session && !isPublicPath && !isApiRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // next‑intl مڈل ویئر کو چلائیں (یہ لوکیل، ترجمے وغیرہ سنبھالے گا)
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
