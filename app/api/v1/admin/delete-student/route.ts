export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { StudentService } from "@/services/StudentService";
import { AttendanceService } from "@/services/attendance.service";
import { FeesService } from "@/services/fees.service";
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

        const studentService = new StudentService();
        const student = await studentService.getById(tenantId, studentId);
        if (!student) {
          return createErrorResponse(404, "Student not found");
        }

        const attendanceService = new AttendanceService();
        const studentAttendance = await attendanceService.findByStudentId(tenantId, studentId);
        for (const rec of studentAttendance) {
          if (!rec.id) continue;
          await attendanceService.deleteAttendance(tenantId, rec.id, user.uid);
        }

        const feesService = new FeesService();
        const studentFees = await feesService.findByStudent(tenantId, studentId, 9999);
        for (const fee of studentFees) {
          await feesService.deleteFee(fee.id!, tenantId);
        }

        await studentService.hardDelete(tenantId, studentId, user.uid);

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
