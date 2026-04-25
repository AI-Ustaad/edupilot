import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromSession } from "@/lib/auth-utils";

export async function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;

  const { pathname } = req.nextUrl;

  // 🔐 Protected Routes
  const protectedRoutes = [
    "/dashboard",
    "/students",
    "/staff",
    "/attendance",
    "/classes",
    "/fees",
    "/settings",
    "/timetable",
    "/student-profile",
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ❌ Not logged in → redirect to login
  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔍 Get user from session
  let user = null;
  if (session) {
    try {
      user = await getUserFromSession(session);
    } catch (err) {
      console.error("Session error:", err);
    }
  }

  // 🚧 Setup not completed → force setup page
  if (user && !user.setupCompleted && pathname !== "/setup") {
    return NextResponse.redirect(new URL("/setup", req.url));
  }

  // 🔁 Already logged in → prevent going back to login
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// ⚙️ Where middleware runs
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
