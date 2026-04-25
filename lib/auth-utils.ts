// lib/auth-utils.ts
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export async function getUserFromSession(session?: string) {
  try {
    const sessionCookie = session || cookies().get("session")?.value;
    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

    return {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
    };
  } catch {
    return null;
  }
}
