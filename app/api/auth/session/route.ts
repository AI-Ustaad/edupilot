import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "No token" }, { status: 400 });
    }

    // ✅ Verify Firebase token
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // ✅ Check Firestore user
    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();

    const isNewUser = !userSnap.exists;

    // ✅ Create session cookie (7 days)
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 7 * 1000,
    });

    cookies().set("session", sessionCookie, {
      httpOnly: true,
      secure: true,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      isNewUser,
    });

  } catch (error) {
    console.error("SESSION ERROR:", error);
    return NextResponse.json({ error: "Session failed" }, { status: 500 });
  }
}
