// app/api/users/register-school/route.ts
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { schoolName, phone } = await req.json();

    const session = cookies().get("session")?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(session);

    const tenantRef = adminDb.collection("tenants").doc();
    const tenantId = tenantRef.id;

    await tenantRef.set({
      name: schoolName,
      ownerId: decoded.uid,
      phone,
      plan: "free",
      status: "active",
      createdAt: new Date(),
    });

    await adminDb.collection("users").doc(decoded.uid).set({
      uid: decoded.uid,
      email: decoded.email,
      role: "admin",
      tenantId,
      createdAt: new Date(),
    });

    await adminAuth.setCustomUserClaims(decoded.uid, {
      role: "admin",
      tenantId,
    });

    return NextResponse.json({ success: true, tenantId });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
