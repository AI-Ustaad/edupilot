// lib/auth/auth-server.ts
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";

const GLOBAL_ROLES = new Set(["superAdmin", "support", "system"]);

export async function getSessionUser() {
  const nextHeaders = await import("next/headers");
  let token: string | undefined;

  try {
    const cookieStore = nextHeaders.cookies?.();
    token = cookieStore?.get?.("session")?.value;
  } catch {}

  if (!token) {
    try {
      const headerStore = nextHeaders.headers?.();
      const authHeader = headerStore?.get?.("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    } catch {}
  }

  if (!token) return null;

  let decodedToken: any;
  
  try {
    // 1. Verify as Firebase Session Cookie (standard browser cookie)
    decodedToken = await adminAuth.verifySessionCookie(token, true);
  } catch (e) {
    try {
      // 2. Fallback to Firebase ID Token (Bearer header or direct token)
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (err) {
      logger.error("Session verification failed:", { metadata: { error: err } });
      return null;
    }
  }

  try {
    // 1. Lookup by Firebase UID
    let userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();

    // 2. Email fallback if UID document does not exist yet
    if (!userDoc.exists && decodedToken.email) {
      const snapshot = await adminDb.collection("users").where("email", "==", decodedToken.email).get();
      if (!snapshot.empty) {
        userDoc = snapshot.docs[0];
      }
    }

    if (!userDoc.exists) {
      return {
        uid: decodedToken.uid,
        email: decodedToken.email || "",
        role: decodedToken.role || "guest",
        tenantId: decodedToken.tenantId ?? null,
        onboardingRequired: true,
      };
    }

    const userData = userDoc.data() ?? {};

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || userData.email || "",
      role: userData.role || decodedToken.role || "guest",
      tenantId: userData.tenantId ?? decodedToken.tenantId ?? null,
      onboardingRequired: userData.onboardingRequired ?? false,
    };
  } catch (error) {
    logger.error("Error fetching user data:", { metadata: { error } });
    return null;
  }
}
