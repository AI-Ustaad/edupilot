import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { checkAuthRateLimit } from "@/lib/rate-limit"; // 🆕 Rate Limiting Import

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // 🛡️ 1. CHECK RATE LIMIT FIRST
    const { success, reset } = await checkAuthRateLimit();
    
    if (!success) {
      const resetTime = new Date(reset).toLocaleTimeString();
      return NextResponse.json(
        { 
          success: false, 
          error: `Too many login attempts. Please try again at ${resetTime}.` 
        },
        { 
          status: 429, 
          headers: { "Retry-After": "60" }
        }
      );
    }

    // 2. Proceed with parent login logic
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" }, 
        { status: 400 }
      );
    }

    // Verify the user exists in Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(email);
    
    // Check if user has parent role and tenantId in Firestore
    const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== "parent") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Parent access only" }, 
        { status: 403 }
      );
    }

    // Create custom token with secure claims
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
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" }, 
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" }, 
      { status: 500 }
    );
    }
}
