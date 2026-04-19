import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../lib/firebaseAdmin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = cookies().get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(session);

    const { name, schoolId, role } = await req.json();

    await adminDb.collection("users").doc(decoded.uid).set({
      name,
      email: decoded.email,
      schoolId,
      role: role || "admin",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Create user failed" }, { status: 500 });
  }
}
