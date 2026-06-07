// app/api/auth/parent-login/route.ts
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Firebase Admin SDK سے user کو تلاش کریں
    const user = await adminAuth.getUserByEmail(email);
    
    // Custom Token بنائیں تاکہ client Firebase Auth سے لاگ ان کر سکے
    const customToken = await adminAuth.createCustomToken(user.uid);
    
    return NextResponse.json({ success: true, customToken });
  } catch (error: any) {
    console.error("Parent Login Error:", error);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
