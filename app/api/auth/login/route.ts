import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "No token" }, { status: 400 });
    }

    // 🔐 Verify Firebase ID token
    const decoded = await adminAuth.verifyIdToken(idToken);

    // 🍪 Create session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({
      success: true,
      uid: decoded.uid,
      email: decoded.email,
    });

    // 🍪 Set cookie
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: expiresIn / 1000,
    });

    // 🧠 IMPORTANT: Create / fetch user with schoolId
    await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/users/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 401 });
  }
}
