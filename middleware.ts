import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  // سیکیورٹی چیک (Session Check)
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

  // نارمل طریقے سے پیج کو لوڈ ہونے دیں (i18n کُکیز سے خود ہینڈل کر لے گا)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|sw.js|icons|images|assets|manifest.json).*)"],
};
