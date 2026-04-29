import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const { pathname } = req.nextUrl;

  // 1. اگر یوزر لاگ ان نہیں ہے اور کسی پرائیویٹ پیج پر جانے کی کوشش کرے
  // یہاں آپ اپنے تمام پرائیویٹ روٹس لکھ سکتے ہیں
  const protectedRoutes = ["/dashboard", "/accounts", "/attendance", "/students"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!session && isProtectedRoute) {
    console.log("🚫 No session, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. اگر یوزر لاگ ان ہے اور واپس لاگ ان پیج پر جانا چاہے
  if (session && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// یہ سیکشن بتاتا ہے کہ مڈل ویئر کن فائلوں پر رن نہیں ہونا چاہیے
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
