export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  // اگر فائر بیس ریڈی نہیں ہے تو ایرر دے دو، لیکن ایپ کو کریش مت کرو
  if (!adminAuth) {
    return NextResponse.json({ error: "Firebase Admin is not configured. Add env variables in Vercel." }, { status: 500 });
  }

  try {
    const { idToken } = await req.json();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; 
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    cookies().set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.log("Login Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
