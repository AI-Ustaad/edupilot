import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
  const session = cookies().get("session")?.value;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);

    return NextResponse.json({
      uid: decoded.uid,
      email: decoded.email,
    });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
