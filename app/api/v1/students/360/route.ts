export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentRepository } from "@/repositories/student.repository";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { MarksRepository } from "@/repositories/marks.repository";
import { FeesRepository } from "@/repositories/fees.repository";
import { BehaviorRepository } from "@/repositories/behavior.repository";
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

          const studentRepo = new StudentRepository();
          const student = await studentRepo.findById(studentId, tenantId);

          if (!student) {
            return Response.json({ success: false, error: "Student not found" }, { status: 404 });
          }

          // Use repositories for all data fetching - no direct Firestore access
          const [marks, attendance, fees, behavior] = await Promise.all([
            new MarksRepository().findByStudent(tenantId, studentId),
            new AttendanceRepository().findByStudentId(tenantId, studentId),
            new FeesRepository().findByStudent(tenantId, studentId, 20),
            new BehaviorRepository().findByStudent(studentId, tenantId, 20),
          ]);

          return Response.json({
            success: true,
            data: {
              student,
              academic: { marks },
              attendance: { records: attendance },
              financial: { records: fees },
              behavior: { records: behavior },
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
