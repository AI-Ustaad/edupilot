// app/api/auth/session/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);

    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    cookies().set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: true, // production only
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      status: "success",
      uid: decoded.uid,
    });

  } catch (error) {
    console.error("Session Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
