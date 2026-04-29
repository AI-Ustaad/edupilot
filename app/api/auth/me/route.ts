import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const session = cookies().get("session")?.value;

    if (!session) {
      return NextResponse.json({ user: null });
    }

    const decoded = await adminAuth.verifySessionCookie(session, true);

    return NextResponse.json({
      user: {
        uid: decoded.uid,
        email: decoded.email,
      },
    });

  } catch (err) {
    return NextResponse.json({ user: null });
  }
}
