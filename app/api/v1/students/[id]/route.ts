// app/api/v1/students/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/auth/auth-server";

// 🛡️ Direct Route Handler (No wrappers to avoid params dropping)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = params.id;
    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    // Directly fetch from Firestore
    const docRef = adminDb.collection("students").doc(studentId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Student not found in DB" }, { status: 404 });
    }

    const studentData = docSnap.data() as any;

    // Tenant Isolation Check
    if (studentData.tenantId !== user.tenantId) {
      return NextResponse.json({ error: "Forbidden: Tenant mismatch" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: { id: docSnap.id, ...studentData }
    });

  } catch (error: any) {
    console.error("[GET /students/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
