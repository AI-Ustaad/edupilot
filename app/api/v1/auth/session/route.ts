export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ success: true });

    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return response;
  } catch (err) {
    logger.error("Session Error:", { metadata: { error: err } });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
