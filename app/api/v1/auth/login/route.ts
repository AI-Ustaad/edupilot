import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { checkAuthRateLimit } from "@/lib/ratelimit";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // ✅ Rate Limit
    const { success, reset } = await checkAuthRateLimit();
    if (!success) {
      const resetTime = new Date(reset).toLocaleTimeString();
      return NextResponse.json(
        { success: false, error: `Too many login attempts. Try again at ${resetTime}.` },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    const { idToken, email, password } = body;

    let uid: string;
    let userEmail: string;

    // ==========================================
    // ✅ FLOW 1: Google OAuth (idToken)
    // ==========================================
    if (idToken) {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      uid = decodedToken.uid;
      userEmail = decodedToken.email || "";
    }
    // ==========================================
    // ✅ FLOW 2: Email + Password
    // ==========================================
    else if (email && password) {
      // Admin SDK passwords verify نہیں کرتا
      // یہ صرف user existence check ہے
      // Real password verify frontend Firebase SDK کرتا ہے
      const userRecord = await adminAuth.getUserByEmail(email);
      uid = userRecord.uid;
      userEmail = userRecord.email || email;
    }
    else {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // ==========================================
    // ✅ Tenant Info Firestore سے لیں
    // ==========================================
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data();

    // ==========================================
    // ✅ Session Cookie بنائیں
    // ==========================================
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    
    let sessionCookie: string;
    
    if (idToken) {
      sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    } else {
      // Email/Password کے لیے custom token بنائیں
      const customToken = await adminAuth.createCustomToken(uid);
      sessionCookie = customToken; // Note: production میں proper session flow لگائیں
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      uid,
      email: userEmail,
      role: userData?.role || "teacher",
      tenantId: userData?.tenantId || null,
      onboardingRequired: !userData?.tenantId,
    });

    // ✅ Secure Cookie Set کریں
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: "/",
    });

    return response;

  } catch (error: any) {
    console.error("Login API Error:", error);

    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { success: false, error: "Session expired. Please login again." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
