import { NextResponse } from "next/server";
import { adminAuth } from "../../../../lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "No token" }, { status: 400 });
    }

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
    return NextResponse.json({ error: "Session error" }, { status: 401 });
  }
}
