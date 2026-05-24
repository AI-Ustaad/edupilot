import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function getSessionUser() {
  const session = cookies().get("session")?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      return {
        uid: decoded.uid,
        email: decoded.email,
        onboardingRequired: true,
      };
    }

    const userData = userDoc.data();
    const onboardingRequired = !userData?.tenantId;

    return {
      uid: decoded.uid,
      email: decoded.email,
      tenantId: userData?.tenantId || null,
      role: userData?.role || "teacher",
      onboardingRequired,
    };
  } catch (error) {
    return null;
  }
}
