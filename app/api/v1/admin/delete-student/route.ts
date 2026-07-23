export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { StudentService } from "@/services/StudentService";
import { AttendanceService } from "@/services/attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { FeesService } from "@/services/fees.service";
import { FeesRepository } from "@/repositories/fees.repository";
import { AuditService } from "@/services/AuditService";
import type { TenantContext } from "@/types/api";

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.delete)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("id");
        if (!studentId) {
          return createErrorResponse(400, "Student ID is required");
        }

        // Verify student exists
        const studentService = new StudentService();
        const student = await studentService.getById(tenantId, studentId);
        if (!student) {
          return createErrorResponse(404, "Student not found");
        }

        // Cascade delete using services (not direct Firestore)
        const attendanceService = new AttendanceService(new AttendanceRepository());
        const studentAttendance = await attendanceService.findByStudentId(tenantId, studentId);
        for (const rec of studentAttendance) {
          await attendanceService.deleteAttendance(rec.id, tenantId);
        }

        const feesService = new FeesService(new FeesRepository());
        const studentFees = await (new FeesRepository()).findByStudent(tenantId, studentId, 9999);
        for (const fee of studentFees) {
          await feesService.deleteFee(fee.id, tenantId);
        }

        // Finally delete the student (this now publishes STUDENT_DELETED event)
        await studentService.hardDelete(tenantId, studentId, user.uid);

        // Audit log
        const audit = new AuditService();
        await audit.log({
          action: "STUDENT_DELETED",
          userId: user.uid,
          tenantId,
          entityId: studentId,
          entityType: "student",
                   metadata: { name: `${student.personal.firstName} ${student.personal.lastName || ""}`.trim() },
        });

        return createSuccessResponse(null, { message: "Student and all related data deleted successfully" });
      })
    )
  )
);
