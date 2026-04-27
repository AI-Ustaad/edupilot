import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // 👈 نیا اور پکا طریقہ
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // فائر بیس کا ٹوکن وویریفائی کریں
    await adminAuth.verifyIdToken(idToken);

    // سیشن کوکی بنائیں (5 دن کے لیے)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // 🔥 THE FIX: Next.js 14 کا مستند طریقہ کوکی سیو کرنے کا
    cookies().set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Vercel پر خود ٹرو (true) ہو جائے گا
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("SESSION ERROR:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
