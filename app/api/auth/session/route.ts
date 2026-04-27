import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // فائر بیس سے ٹوکن وویریفائی کریں
    await adminAuth.verifyIdToken(idToken);

    // 5 دن کا سیشن بنائیں
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // 🔥 THE BULLETPROOF FIX: Next.js 14 کا سب سے پکا طریقہ
    const response = NextResponse.json({ status: "success" }, { status: 200 });

    // Response کے اندر زبردستی کوکی (Cookie) چپکا دیں
    response.cookies.set({
      name: "session",
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: true, // Vercel پر یہ لازمی ہے
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("SESSION ERROR:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
