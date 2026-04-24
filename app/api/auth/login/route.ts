import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "No token" }, { status: 400 });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    cookies().set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 401 });
  }
}
