// app/api/v1/students/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/auth/auth-server";

export const dynamic = 'force-dynamic';

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

    const docRef = adminDb.collection("students").doc(studentId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Student not found in DB" }, { status: 404 });
    }

    const studentData = docSnap.data() as any;

    if (studentData.tenantId !== user.tenantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const studentId = params.id;
    const body = await req.json();

    await adminDb.collection("students").doc(studentId).update({
      ...body,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Student updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const studentId = params.id;
    
    // Soft delete (recommended)
    await adminDb.collection("students").doc(studentId).update({
      deleted: true,
      deletedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Student deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
