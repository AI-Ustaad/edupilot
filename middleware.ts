import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// i18n middleware
const intlMiddleware = createMiddleware({
  locales: ["en", "ur"],
  defaultLocale: "en",
  localeDetection: true,
});

// مشترکہ middleware
export default async function middleware(req: NextRequest) {
  // 1. پہلے زبان کا تعین اور لوکل ری ڈائریکٹ
  const intlResponse = await intlMiddleware(req);
  if (intlResponse) return intlResponse; // اگر i18n نے ری ڈائریکٹ کیا تو واپس کریں

  // 2. اب سیکیورٹی چیک (Session Check)
  const session = req.cookies.get("session")?.value;
  const { pathname } = req.nextUrl;

  // عوامی (Public) راستے — ان پر بغیر لاگ ان کے بھی جا سکتے ہیں
  const isPublicPath =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/" ||
    pathname === "/callback" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  // API راستے — انہیں نظر انداز کریں (وہ اپنی سطح پر تصدیق کرتے ہیں)
  const isApiRoute = pathname.startsWith("/api");

  // اگر صارف لاگ ان نہیں، راستہ عوامی نہیں، اور API نہیں ہے تو لاگ ان پر بھیجیں
  if (!session && !isPublicPath && !isApiRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// صرف صفحات پر لاگو کریں، اسٹیٹک فائلوں اور APIs پر نہیں
export const config = {
  matcher: ["/((?!_next|api|favicon.ico|sw.js|icons|images|assets|manifest.json).*)"],
};
