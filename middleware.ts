import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("session")?.value;

  // اگر یوزر کے پاس سیشن نہیں ہے، تو اسے لاگ ان پر بھیج دو
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // اگر سیشن ہے تو اندر جانے دو
  return NextResponse.next();
}

// ⚠️ صرف محفوظ (Protected) راؤٹس پر مڈل ویئر چلائیں
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/students/:path*",
    "/attendance/:path*",
    "/staff/:path*",
    "/fees/:path*",
    "/classes/:path*",
    "/timetable/:path*",
    "/settings/:path*",
    "/setup/:path*", // 👈 Setup کو بھی شامل کر لیں
  ],
};
