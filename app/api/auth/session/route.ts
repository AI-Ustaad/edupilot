import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    // ٹوکن کو ویریفائی کریں
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    if (decodedToken) {
      // سیشن کُکی بنائیں (5 دن کے لیے)
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
      
      // محفوظ کُکی سیٹ کریں
      cookies().set("session", sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true, // یہ سیکیورٹی کے لیے بہت ضروری ہے
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      return NextResponse.json({ status: "success" }, { status: 200 });
    }
    
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  } catch (error) {
    console.error("Session Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
