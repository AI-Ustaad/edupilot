import { adminAuth, adminDb } from "./firebase-admin";

export async function getUserFromSession(sessionCookie: string | undefined) {
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();

    if (!userDoc.exists) return null;

    const userData = userDoc.data();
    
    // اگر رول غائب ہے تو محفوظ طریقے سے Null ریٹرن کریں
    if (!userData?.role) return null;
    
    return {
      uid: decodedClaims.uid,
      email: userData.email,
      role: userData.role,
      name: userData.name,
    };
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

// یہ ہیلپر (Helper) ہمیں ہر API میں رول چیک کرنے میں مدد دے گا
export function requireRole(user: any, requiredRole: string) {
  if (!user || !user.role) return false;
  return user.role === requiredRole;
}
