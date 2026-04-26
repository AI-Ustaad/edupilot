import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 400 }
      );
    }

    // Verify Firebase ID Token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create session cookie (valid for 5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({ status: "success" });

    // Set secure cookie
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return response;
  } catch (error) {
    console.error("SESSION ERROR:", error);

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
