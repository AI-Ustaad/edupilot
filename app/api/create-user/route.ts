// app/api/create-user/route.ts
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { getUserFromSession } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = cookies().get("session")?.value;
    const adminUser = await getUserFromSession(session);

    if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (adminUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { email, password, role } = await req.json();

    const userRecord = await adminAuth.createUser({
      email,
      password,
    });

    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      role,
      tenantId: adminUser.tenantId,
      createdAt: new Date(),
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role,
      tenantId: adminUser.tenantId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
