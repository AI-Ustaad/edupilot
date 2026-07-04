// app/api/v1/students/[id]/comment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/auth/auth-server";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { comment } = await req.json();
    const studentId = params.id;

    if (!comment) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    // سٹوڈنٹ کے ڈاکیومنٹ میں کمنٹ محفوظ کریں
    await adminDb.collection("students").doc(studentId).update({
      teacherComment: comment,
      updatedAt: new Date(),
      updatedBy: user.uid,
    });

    return NextResponse.json({ success: true, message: "Comment saved successfully" });

  } catch (error: any) {
    console.error("Save Comment API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
