// lib/auth/auth-server.ts
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// 🆕 Global roles that are allowed without a tenant
const GLOBAL_ROLES = ["superAdmin", "support", "system"];

export async function getSessionUser() {
  const { cookies } = await import("next/headers");
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    let userDoc = await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    // 🆕 Structured migration warning
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
        const activeDoc =
          snapshot.docs.find(
            (d) => d.data().status !== "migrated"
          ) ?? snapshot.docs[0];
        userDoc = activeDoc;
      }
    }

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

    // 🆕 Tenant validation – skip for global roles
    if (
      userData.role &&
      userData.role !== "guest" &&
      !GLOBAL_ROLES.includes(userData.role) &&
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
    console.error("Session verification failed:", error);
    return null;
  }
}
