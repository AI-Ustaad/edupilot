import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { checkAuthRateLimit } from "@/lib/ratelimit"; // ✅ Correct path (no hyphen)

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // ==========================================
    // 🛡️ 1. CHECK RATE LIMIT FIRST (10 req/min per IP)
    // ==========================================
    const { success, reset } = await checkAuthRateLimit();
    
    if (!success) {
      const resetTime = new Date(reset).toLocaleTimeString();
      return NextResponse.json(
        { 
          success: false, 
          error: `Too many login attempts. Please try again at ${resetTime}.` 
        },
        { 
          status: 429, // Too Many Requests
          headers: { "Retry-After": "60" }
        }
      );
    }

    // ==========================================
    // 2. Parse & Validate Request Body
    // ==========================================
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" }, 
        { status: 400 }
      );
    }

    // ==========================================
    // 3. Verify User Exists & Has Parent Role
    // ==========================================
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

    // ==========================================
    // 4. Create Custom Token with Secure Claims
    // ==========================================
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
    
    // Handle specific Firebase Auth errors gracefully
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" }, 
        { status: 401 }
      );
    }

    // Generic error for all other cases
    return NextResponse.json(
      { success: false, error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
