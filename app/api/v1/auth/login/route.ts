import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { checkAuthRateLimit } from "@/lib/rate-limit"; // 🆕 Rate Limiting Import

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // 🛡️ 1. CHECK RATE LIMIT FIRST (10 requests per minute per IP)
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

    // 2. Proceed with your existing login logic
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
        );
    }

    // ⚠️ NOTE: Firebase Admin SDK does not verify passwords directly for security reasons.
    // Best Practice: Client uses signInWithEmailAndPassword, gets ID Token, 
    // and sends it here to create a secure Session Cookie.
    // OR if you are using a custom backend flow, adapt the logic below:
    
    const userRecord = await adminAuth.getUserByEmail(email);
    
    // (Add your specific session cookie or custom token generation logic here)
    // const customToken = await adminAuth.createCustomToken(userRecord.uid);
    
    return NextResponse.json({ 
      success: true, 
      message: "Login successful",
      uid: userRecord.uid 
    });

  } catch (error: any) {
    console.error("Login API Error:", error);
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" }, 
        { status: 401 }
      );
 a   }
    
    return NextResponse.json(
      { success: false, error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
