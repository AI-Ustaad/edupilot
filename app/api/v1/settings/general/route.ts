// app/api/v1/settings/general/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/auth/auth-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const doc = await adminDb.collection("tenants").doc(user.tenantId).collection("settings").doc("general").get();
    return NextResponse.json({ success: true, data: doc.exists ? doc.data() : {} });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    
    await adminDb.collection("tenants").doc(user.tenantId).collection("settings").doc("general").set({
      ...body,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
