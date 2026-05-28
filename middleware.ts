import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// next-intl کا مڈل ویئر
const intlMiddleware = createMiddleware({
  locales: ["en", "ur"],
  defaultLocale: "en",
  localePrefix: "never", // 👈 یہ وہ جادوئی لائن ہے جو سفید سکرین کا مسئلہ حل کرے گی
});

export default async function middleware(req: NextRequest) {
  // 1. پہلے زبان کا تعین کریں
  const intlResponse = intlMiddleware(req);

  // 2. سیکیورٹی چیک (آپ کا پرانا لاجک مکمل طور پر محفوظ ہے)
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

  // اگر سیشن نہیں ہے تو لاگ ان پر بھیجیں
  if (!session && !isPublicPath && !isApiRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // اگر سب ٹھیک ہے تو زبان کے ساتھ پیج دکھائیں
  return intlResponse;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|sw.js|icons|images|assets|manifest.json).*)"],
};
