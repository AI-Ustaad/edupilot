// app/api/auth/parent-login/route.ts
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// Force Node.js runtime for Firebase Admin SDK
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
    }

    // 1. Verify user exists and get UID
    const userRecord = await adminAuth.getUserByEmail(email);
    
    // 2. Check if user has parent role and tenantId in Firestore
    const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== "parent") {
      return NextResponse.json({ success: false, error: "Unauthorized: Parent access only" }, { status: 403 });
    }

    // 3. Create custom token with secure claims
    const customToken = await adminAuth.createCustomToken(userRecord.uid, {
      role: "parent",
      tenantId: userData.tenantId,
    });

    return NextResponse.json({ 
      success: true, 
      customToken, 
      uid: userRecord.uid 
    });

  } catch (error: any) {
    console.error("Parent Login API Error:", error);
    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
  }
}
