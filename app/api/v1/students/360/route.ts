export const dynamic = 'force-dynamic';

import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { logger } from "@/lib/logger/logger";
import type { TenantContext } from "@/types/api";

export const runtime = 'nodejs';

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        try {
          const { searchParams } = new URL(req.url);
          const studentId = searchParams.get("id");

          if (!studentId) {
            return Response.json({ success: false, error: "Student ID required" }, { status: 400 });
          }

          const studentSnap = await adminDb.collection("students").doc(studentId).get();
          
          if (!studentSnap.exists || studentSnap.data()?.tenantId !== tenantId) {
            return Response.json({ success: false, error: "Student not found" }, { status: 404 });
          }

          const student = { id: studentSnap.id, ...studentSnap.data() };

          // Use Repository for attendance instead of direct Firestore access
          const attendanceRepo = new AttendanceRepository();
          const [marksSnap, attendance, feesSnap] = await Promise.all([
            adminDb.collection("marks").where("studentId", "==", studentId).limit(50).get(),
            attendanceRepo.findByStudentId(tenantId, studentId),
            adminDb.collection("fees").where("studentId", "==", studentId).limit(20).get(),
          ]);

          const marks = marksSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((m: any) => m.tenantId === tenantId);
          const fees = feesSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((f: any) => f.tenantId === tenantId);

          return Response.json({
            success: true,
            data: {
              student,
              academic: { marks },
              attendance: { records: attendance },
              financial: { records: fees },
            },
          });
        } catch (error: any) {
          logger.error("Student 360 Error:", { metadata: { error } });
          return Response.json({ success: false, error: "Internal Server Error" }, { status: 500 });
        }
      })
    )
  )
);
