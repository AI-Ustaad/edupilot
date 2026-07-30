export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { StudentService } from "@/services/StudentService";
import { AttendanceService } from "@/services/attendance.service";
import { FeesService } from "@/services/fees.service";
import { AuditService } from "@/services/AuditService";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

function getIdFromUrl(req: Request) {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.delete)(async (req: Request, { tenantId, user }: TenantContext) => {
        const id = getIdFromUrl(req);

        const studentService = new StudentService();
        const student = await studentService.getById(tenantId, id);
        if (!student) return createErrorResponse(404, "Student not found");

        const attendanceService = new AttendanceService();
        const studentAttendance = await attendanceService.findByStudentId(tenantId, id);
        for (const rec of studentAttendance) {
          if (!rec.id) continue;
          await attendanceService.deleteAttendance(tenantId, rec.id, user.uid);
        }

        const feesService = new FeesService();
        const studentFees = await feesService.findByStudent(tenantId, id, 9999);
        for (const fee of studentFees) {
          if (!fee.id) continue;
          await feesService.deleteFee(tenantId, fee.id!, user.uid);
        }

        await studentService.delete(tenantId, id, user.uid);

        const audit = new AuditService();
        await audit.log({
          action: "GDPR_DELETION",
          userId: user.uid,
          tenantId,
          entityId: id,
          entityType: "student",
          metadata: { name: student.fullName },
        });

        return createSuccessResponse(null, { message: "Student data permanently deleted" });
      })
    )
  )
);
