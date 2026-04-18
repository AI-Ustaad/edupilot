import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    // 1. ٹوکن کو ویریفائی کریں (یہاں وہ firebase-admin کام آئے گا)
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    if (decodedToken) {
      // 2. اگر ٹوکن ٹھیک ہے، تو ایک محفوظ سیشن کُکی سیٹ کریں
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 دن کے لیے
      const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
      
      cookies().set("session", sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true, // ہیکر اسے براؤزر سے نہیں چرا سکے گا
        secure: true,
      });

      return NextResponse.json({ status: "success" }, { status: 200 });
    }
    
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
