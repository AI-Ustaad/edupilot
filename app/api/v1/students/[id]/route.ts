import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const url = new URL(req.url);
        const studentId = url.pathname.split("/").pop();

        if (!studentId) {
          return NextResponse.json({ success: false, message: "Student ID is required" }, { status: 400 });
        }

        try {
          const studentRef = adminDb.collection("students")
            .where("tenantId", "==", tenantId)
            .where("__name__", "==", studentId);
          
          const studentSnap = await studentRef.get();

          if (studentSnap.empty) {
            return NextResponse.json({ success: false, message: "Student not found or access denied" }, { status: 404 });
          }

          const studentData = studentSnap.docs[0].data();
          const studentDocId = studentSnap.docs[0].id;

          const [attendanceSnap, marksSnap, feesSnap] = await Promise.all([
            adminDb.collection("attendance").where("tenantId", "==", tenantId).where("studentId", "==", studentDocId).orderBy("date", "desc").limit(30).get(),
            adminDb.collection("marks").where("tenantId", "==", tenantId).where("studentId", "==", studentDocId).orderBy("createdAt", "desc").limit(10).get(),
            adminDb.collection("fees").where("tenantId", "==", tenantId).where("studentId", "==", studentDocId).orderBy("createdAt", "desc").limit(5).get()
          ]);

          const attendance = attendanceSnap.docs.map(d => d.data());
          const marks = marksSnap.docs.map(d => d.data());
          const fees = feesSnap.docs.map(d => d.data());

          const presentCount = attendance.filter((a: any) => a.status === "Present").length;
          const attPercent = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 100;
          const attRisk = attPercent < 75 ? 40 : 0;

          const avgAcademic = marks.length > 0 
            ? (marks.reduce((sum: number, m: any) => sum + ((m.marksObtained / m.totalMarks) * 100), 0) / marks.length)
            : 100;
          const acadRisk = avgAcademic < 40 ? 40 : (avgAcademic < 60 ? 20 : 0);

          const hasPendingFees = fees.some((f: any) => f.status === "Pending" || (f.totalAmount && f.amountPaid < f.totalAmount));
          const feeRisk = hasPendingFees ? 20 : 0;

          const totalRiskScore = attRisk + acadRisk + feeRisk;
          let riskLevel = "Low";
          let riskReason = "On Track";

          if (totalRiskScore >= 60) {
            riskLevel = "High";
            riskReason = "Critical: Attendance/Academic/Fee Issues";
          } else if (totalRiskScore >= 20) {
            riskLevel = "Medium";
            riskReason = "Needs Attention";
          }

          return NextResponse.json({
            success: true,
            data: {
              student: { id: studentDocId, ...studentData },
              attendance,
              marks,
              fees,
              risk: {
                score: totalRiskScore,
                level: riskLevel,
                reason: riskReason,
                breakdown: { 
                  attendance: Math.round(attPercent), 
                  academics: Math.round(avgAcademic), 
                  fees: hasPendingFees ? "Pending" : "Clear" 
                }
              }
            }
          });

        } catch (error) {
          console.error("Student360 API Error:", error);
          return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
        }
      })
    )
  )
);
