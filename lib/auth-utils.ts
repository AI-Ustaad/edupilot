import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";

export type SessionUser = {
  uid: string;
  email?: string;
  role?: string;
  tenantId?: string;
};

// 🔐 Get user from session cookie
export async function getUserFromSession(): Promise<SessionUser | null> {
  try {
    const session = cookies().get("session")?.value;

    if (!session) return null;

    const decoded = await adminAuth.verifySessionCookie(session);

    return {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,        // 🔥 from custom claims
      tenantId: decoded.tenantId // 🔥 from custom claims
    };
  } catch (error) {
    return null;
  }
}
