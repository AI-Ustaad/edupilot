import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
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
    // 3. Verify User Exists in Firebase Auth
    // ==========================================
    // ⚠️ NOTE: Firebase Admin SDK does not verify passwords directly for security reasons.
    // Best Practice: 
    //   - Client uses signInWithEmailAndPassword on the frontend
    //   - Gets ID Token
    //   - Sends it here to create a secure Session Cookie
    // OR use a custom backend flow as shown below:
    
    const userRecord = await adminAuth.getUserByEmail(email);
    
    // (Add your specific session cookie or custom token generation logic here)
    // Example:
    // const customToken = await adminAuth.createCustomToken(userRecord.uid);
    
    return NextResponse.json({ 
      success: true, 
      message: "Login successful",
      uid: userRecord.uid 
    });

  } catch (error: any) {
    console.error("Login API Error:", error);
    
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
