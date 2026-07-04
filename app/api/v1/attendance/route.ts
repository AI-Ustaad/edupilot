// app/api/v1/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/auth/auth-server";
import { executeWorkflows } from "@/lib/automation/workflow-engine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, studentName, classGrade, section, date, status } = body;

    if (!studentId || !date || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 1. Attendance Record Save یا Update کریں
    const attendanceRef = adminDb.collection("attendance").doc();
    
    await attendanceRef.set({
      tenantId: user.tenantId,
      studentId,
      studentName: studentName || "",
      classGrade: classGrade || "",
      section: section || "",
      date,
      status,
      createdBy: user.uid,
      createdAt: new Date(),
      deleted: false,
    });

    // 2. 🚀 Workflow Automation Trigger
    // اگر سٹوڈنٹ Absent ہوا ہو، تو Parent کو Email بھیجیں
    if (status === "Absent") {
      
      // سٹوڈنٹ کا ڈاکیومنٹ Fetch کریں تاکہ Parent کی Email مل سکے
      const studentDoc = await adminDb.collection("students").doc(studentId).get();
      const studentData = studentDoc.data();
      
      // سٹوڈنٹ کے ریکارڈ سے Parent کی Email Extract کریں
      const parentEmail = studentData?.guardianEmail || studentData?.parentEmail || null;

      // اگر Parent کی Email موجود ہو، تو Workflow Engine کو Trigger کریں
      if (parentEmail) {
        await executeWorkflows({
          tenantId: user.tenantId,
          trigger: "attendance.absent",
          data: {
            studentName: studentName || studentData?.fullName || "Student",
            parentEmail: parentEmail,
            date: date
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Attendance saved successfully",
      data: { id: attendanceRef.id } 
    });

  } catch (error: any) {
    console.error("[Attendance API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET Request (اگر آپ کے پاس پہلے سے موجود ہو)
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classGrade = searchParams.get("classGrade");
    const section = searchParams.get("section");
    const date = searchParams.get("date");

    if (!classGrade || !section || !date) {
      return NextResponse.json({ success: false, error: "Missing query parameters" }, { status: 400 });
    }

    const snapshot = await adminDb.collection("attendance")
      .where("tenantId", "==", user.tenantId)
      .where("classGrade", "==", classGrade)
      .where("section", "==", section)
      .where("date", "==", date)
      .where("deleted", "==", false)
      .get();

    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, data: records });

  } catch (error: any) {
    console.error("[Attendance GET API Error]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
