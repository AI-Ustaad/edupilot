import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../../lib/firebase-admin";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const session = cookies().get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(session);

    const doc = await adminDb.collection("users").doc(decoded.uid).get();

    return NextResponse.json(doc.data());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
