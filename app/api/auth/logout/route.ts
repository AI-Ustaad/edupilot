import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST() {
  const session = cookies().get("session")?.value;

  if (session) {
    try {
      const decoded = await adminAuth.verifySessionCookie(session);
      await adminAuth.revokeRefreshTokens(decoded.sub);
    } catch (e) {
      console.error("Token revocation failed:", e);
    }
  }

  cookies().set("session", "", {
    maxAge: 0,
    path: "/",
  });

  return NextResponse.json({ success: true });
}
