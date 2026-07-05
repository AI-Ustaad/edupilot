// app/api/v1/admin/feature-flags/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/auth/auth-server";

export const runtime = "nodejs";

// 📥 GET: Fetch all feature flags for the tenant
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const docRef = adminDb.collection("tenants").doc(user.tenantId).collection("settings").doc("feature-flags");
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      // If no flags are set, return empty object (default true will be handled by frontend)
      return NextResponse.json({ success: true, data: {} });
    }

    return NextResponse.json({ success: true, data: docSnap.data() });
  } catch (error: any) {
    console.error("Feature Flags GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 📤 POST: Update a specific feature flag
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { feature, enabled } = await req.json();

    if (!feature || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Feature name and enabled status are required" }, { status: 400 });
    }

    const docRef = adminDb.collection("tenants").doc(user.tenantId).collection("settings").doc("feature-flags");
    
    // Merge the specific flag into the document
    await docRef.set({
      [feature]: enabled,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true, message: "Feature flag updated successfully" });

  } catch (error: any) {
    console.error("Feature Flags POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
