export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

export const runtime = 'nodejs';

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("id");

        if (!studentId) {
          return NextResponse.json(
            { success: false, error: "Student ID required" },
            { status: 400 }
          );
        }

        // 🔒 Verify student belongs to tenant
        const studentSnap = await adminDb.collection("students").doc(studentId).get();
        
        if (!studentSnap.exists || studentSnap.data()?.tenantId !== tenantId || studentSnap.data()?.deleted) {
          return NextResponse.json(
            { success: false, error: "Student not found" },
            { status: 404 }
          );
        }

        const student = { id: studentSnap.id, ...studentSnap.data() };

        // Parallel fetch all related data
        const [marksSnap, attendanceSnap, feesSnap, behaviorSnap] = await Promise.all([
          adminDb.collection("marks")
            .where("tenantId", "==", tenantId)
            .where("studentId", "==", studentId)
            .where("deleted", "==", false)
            .get(),
          adminDb.collection("attendance")
            .where("tenantId", "==", tenantId)
            .where("studentId", "==", studentId)
            .where("deleted", "==", false)
            .orderBy("date", "desc")
            .limit(30)
            .get(),
          adminDb.collection("fees")
            .where("tenantId", "==", tenantId)
            .where("studentId", "==", studentId)
            .where("deleted", "==", false)
            .get(),
          adminDb.collection("behavior")
            .where("tenantId", "==", tenantId)
            .where("studentId", "==", studentId)
            .where("deleted", "==", false)
            .orderBy("date", "desc")
            .limit(10)
            .get(),
        ]);

        // Calculate aggregates
        const marks = marksSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        const totalMarks = marks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
        const maxMarks = marks.reduce((sum, m) => sum + (m.totalMarks || 0), 0);
        const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : "0";

        const attendance = attendanceSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        const presentDays = attendance.filter(a => a.status === "present").length;
        const attendanceRate = attendance.length > 0 
          ? ((presentDays / attendance.length) * 100).toFixed(1) 
          : "0";

        const fees = feesSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        const totalFees = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
        const paidFees = fees.filter(f => f.status === "paid").reduce((sum, f) => sum + (f.amount || 0), 0);

        const behavior = behaviorSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

        return NextResponse.json({
          success: true,
          data: {
            student,
            academic: {
              marks,
              totalMarks,
              maxMarks,
              percentage,
            },
            attendance: {
              records: attendance,
              presentDays,
              totalDays: attendance.length,
              rate: attendanceRate,
            },
            financial: {
              records: fees,
              totalAmount: totalFees,
              paidAmount: paidFees,
              pendingAmount: totalFees - paidFees,
            },
            behavior,
          },
        });
      })
    )
  )
);
