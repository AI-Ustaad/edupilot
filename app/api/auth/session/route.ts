import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    // سیشن کی مدت (5 دن)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // فائر بیس سے سیشن کوکی بنانا
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    // کوکی کو براؤزر میں سیٹ کرنا
    cookies().set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ SESSION API ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create session", details: err.message },
      { status: 401 }
    );
  }
}
