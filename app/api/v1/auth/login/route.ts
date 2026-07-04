// app/api/v1/auth/login/route.ts
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { checkAuthRateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // ✅ Rate Limit (fail-open)
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

    // Google OAuth
    if (idToken) {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      uid = decodedToken.uid;
      userEmail = decodedToken.email || "";
    }
    // Email/Password (صرف وجود چیک، اصل verify فرنٹ اینڈ SDK کرتا ہے)
    else if (email && password) {
      const userRecord = await adminAuth.getUserByEmail(email);
      uid = userRecord.uid;
      userEmail = userRecord.email || email;
    } else {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Firestore سے user data
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "User profile not found in database." },
        { status: 404 }
      );
    }

    // 🚀 CRITICAL: Set Custom Claims for Real-time Security Rules
    // یہ لائن Firebase Security Rules کو یہ بتائے گی کہ یہ یوزر کس Tenant سے تعلق رکھتا ہے
    await adminAuth.setCustomUserClaims(uid, {
      tenantId: userData.tenantId,
      role: userData.role,
    });

    // Session cookie بنائیں
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    let sessionCookie: string;

    if (idToken) {
      sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    } else {
      // Email/Password کے لیے custom token (production میں proper session flow لگائیں)
      const customToken = await adminAuth.createCustomToken(uid);
      sessionCookie = customToken;
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      uid,
      email: userEmail,
      role: userData?.role ?? "guest",
      tenantId: userData?.tenantId ?? null,
      onboardingRequired: userData?.onboardingRequired ?? true,
    });

    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 5,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login API Error:", error);

    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }
    if (error.code === "auth/id-token-expired") {
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
