import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { checkAuthRateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger/logger";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
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

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" }, 
        { status: 400 }
      );
    }

    const userRecord = await adminAuth.getUserByEmail(email);
    
    const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== "parent") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Parent access only" }, 
        { status: 403 }
      );
    }

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
    logger.error("Parent Login API Error:", { metadata: { error } });
    
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
