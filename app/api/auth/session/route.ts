import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const res = NextResponse.json({ success: true });

    res.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: true,
      maxAge: expiresIn,
      path: "/",
    });

    return res;

  } catch (error) {
    return NextResponse.json({ error: "Session failed" }, { status: 401 });
  }
}
