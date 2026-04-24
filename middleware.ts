import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // 1. چیک کریں کہ کیا یوزر کے پاس سیشن (کوکی) موجود ہے؟
  const session = req.cookies.get("session")?.value;

  // 2. وہ تمام راستے جنہیں ہم محفوظ (Protect) کرنا چاہتے ہیں
  const protectedRoutes = [
    "/dashboard", 
    "/students", 
    "/staff", 
    "/attendance", 
    "/classes", 
    "/fees", 
    "/settings", 
    "/timetable",
    "/student-profile"
  ];
  
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // 3. اگر راستہ محفوظ ہے اور یوزر لاگ ان نہیں ہے، تو سیدھا Login پیج پر پھینک دو
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 4. (Optional) اگر یوزر پہلے سے لاگ ان ہے اور غلطی سے دوبارہ Login پیج پر جائے، تو اسے ڈیش بورڈ پر بھیج دو
  if (req.nextUrl.pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// یہ بتاتا ہے کہ کن فائلوں پر یہ مڈل ویئر چلنا چاہیے (تصویروں اور API کو چھوڑ کر)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
