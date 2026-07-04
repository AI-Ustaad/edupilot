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
      // اگر Session Cookie نہیں ہے، تو Custom Token / ID Token کے طور پر Verify کریں (Email/Password کے لیے)
      decodedToken = await adminAuth.verifyIdToken(sessionCookie);
    } catch (err) {
      console.error("Session verification failed:", err);
      return null;
    }
  }

  try {
    // 1. UID سے تلاش
    let userDoc = await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    // 2. اگر UID document موجود نہیں تو email fallback (صرف read)
    if (!userDoc.exists && decodedToken.email) {
      console.warn("UID migration fallback used", {
        uid: decodedToken.uid,
        email: decodedToken.email,
      });

      const snapshot = await adminDb
        .collection("users")
        .where("email", "==", decodedToken.email)
        .get();

      if (!snapshot.empty) {
        // active document کو ترجیح دیں (migrated نہ ہو)
        const activeDoc =
          snapshot.docs.find((d) => d.data().status !== "migrated") ??
          snapshot.docs[0];
        userDoc = activeDoc;
      }
    }

    // 3. اگر پھر بھی document نہ ملے → guest fallback
    if (!userDoc.exists) {
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: "guest",
        tenantId: null,
        onboardingRequired: true,
      };
    }

    const userData = userDoc.data() ?? {};

    // 4. Tenant validation – non‑guest roles must have a tenant
    if (
      userData.role &&
      userData.role !== "guest" &&
      !GLOBAL_ROLES.has(userData.role) &&
      !userData.tenantId
    ) {
      console.error(
        `User ${decodedToken.uid} has role ${userData.role} but no tenantId – downgrading to guest.`
      );
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: "guest",
        tenantId: null,
        onboardingRequired: true,
      };
    }

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
