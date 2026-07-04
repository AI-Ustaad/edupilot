// lib/auth/auth-server.ts
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const GLOBAL_ROLES = new Set(["superAdmin", "support", "system"]);

export async function getSessionUser() {
  const { cookies } = await import("next/headers");
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) return null;

  let decodedToken;
  
  try {
    // پہلے یہ چیک کریں کہ یہ Session Cookie ہے (Google OAuth کے لیے)
    decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (e) {
    try {
      // اگر Session Cookie نہیں ہے، تو Custom Token کے طور پر Verify کریں (Email/Password کے لیے)
      decodedToken = await adminAuth.verifyIdToken(sessionCookie);
    } catch (err) {
      console.error("Session verification failed:", err);
      return null;
    }
  }

  try {
    // 1. UID سے تلاش
    let userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();

    // 2. اگر UID document موجود نہیں تو email fallback
    if (!userDoc.exists && decodedToken.email) {
      const snapshot = await adminDb.collection("users").where("email", "==", decodedToken.email).get();
      if (!snapshot.empty) {
        userDoc = snapshot.docs[0];
      }
    }

    if (!userDoc.exists) {
      return { uid: decodedToken.uid, email: decodedToken.email, role: "guest", tenantId: null, onboardingRequired: true };
    }

    const userData = userDoc.data() ?? {};

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role || "guest",
      tenantId: userData.tenantId ?? null,
      onboardingRequired: userData.onboardingRequired ?? false,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}
