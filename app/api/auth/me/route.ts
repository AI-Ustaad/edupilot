import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const session = cookies().get("session")?.value;

    if (!session) {
      return NextResponse.json({ user: null });
    }

    const decoded = await adminAuth.verifySessionCookie(session);

    return NextResponse.json({
      uid: decoded.uid,
      email: decoded.email,
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
