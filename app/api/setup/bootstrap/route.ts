import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getUserFromSession } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = user.tenantId;

    // 🔥 SMART NO-SQL ARCHITECTURE: Save everything in ONE document using Arrays
    await adminDb.collection("tenants").doc(tenantId).update({
      name: body.school.name,
      phone: body.school.phone,
      setupCompleted: true,
      // کلاسز، سیکشنز اور پیریڈز کو اسی ڈاکومنٹ کے اندر محفوظ کریں
      settings: {
        classes: body.classes || [],
        sections: body.sections || [],
        periods: body.periods || []
      },
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bootstrap Error:", error);
    return NextResponse.json({ error: "Failed to setup workspace" }, { status: 500 });
  }
}
