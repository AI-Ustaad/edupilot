import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const session = cookies().get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(session);

    const { schoolName, phone } = await req.json();

    if (!schoolName) {
      return NextResponse.json({ error: "School name required" }, { status: 400 });
    }

    // 🔥 1. Create Tenant
    const tenantRef = adminDb.collection("tenants").doc();
    const tenantId = tenantRef.id;

    await tenantRef.set({
      id: tenantId,
      name: schoolName,
      ownerId: decoded.uid,
      plan: "free",
      status: "active",
      createdAt: new Date(),
    });

    // 🔥 2. Create User (Admin)
    const userRef = adminDb.collection("users").doc(decoded.uid);

    await userRef.set({
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || "Admin",
      tenantId: tenantId,
      role: "admin",
      phone: phone || "",
      isActive: true,
      createdAt: new Date(),
    });

    // 🔥 3. Inject Custom Claims (MOST IMPORTANT)
    await adminAuth.setCustomUserClaims(decoded.uid, {
      role: "admin",
      tenantId: tenantId,
    });

    return NextResponse.json({
      success: true,
      tenantId,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register school" }, { status: 500 });
  }
}
