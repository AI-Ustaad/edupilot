export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { StudentService } from "@/services/StudentService";
import { AttendanceService } from "@/services/attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { FeesService } from "@/services/fees.service";
import { FeesRepository } from "@/repositories/fees.repository";
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

        const attendanceService = new AttendanceService(new AttendanceRepository());
        const allAttendance = await attendanceService.listAttendance(tenantId);
        const studentAttendance = allAttendance.filter(r => (r as any).studentId === id);

        const feesService = new FeesService(new FeesRepository());
        const allFees = await feesService.listFees(tenantId);
        const studentFees = allFees.data.filter(f => (f as any).studentId === id);

        // Add more data types as needed

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
