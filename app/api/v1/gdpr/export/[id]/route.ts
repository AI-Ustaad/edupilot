export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { StudentService } from "@/services/StudentService";
import { AttendanceService } from "@/services/attendance.service";
import { FeesService } from "@/services/fees.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

function getIdFromUrl(req: Request) {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const id = getIdFromUrl(req);
        const studentService = new StudentService();
        const student = await studentService.getById(tenantId, id);
        if (!student) return createErrorResponse(404, "Student not found");

        const attendanceService = new AttendanceService();
        const studentAttendance = await attendanceService.findByStudentId(tenantId, id);

        const feesService = new FeesService();
        const studentFees = await feesService.findByStudent(tenantId, id, 9999);

        const exportData = {
          student,
          attendance: studentAttendance,
          fees: studentFees,
        };

        return createSuccessResponse(exportData);
      })
    )
  )
);
