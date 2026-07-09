export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { StudentService } from "@/services/StudentService";
import { AttendanceService } from "@/services/attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { FeesService } from "@/services/fees.service";
import { FeesRepository } from "@/repositories/fees.repository";
import { logAction } from "@/lib/audit";
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

        // Delete attendance records
        const attendanceService = new AttendanceService(new AttendanceRepository());
        const allAttendance = await attendanceService.listAttendance(tenantId);
        const studentAttendance = allAttendance.filter(r => (r as any).studentId === id);
        for (const rec of studentAttendance) {
          await attendanceService.deleteAttendance(rec.id as string, tenantId);
        }

        // Delete fee records
        const feesService = new FeesService(new FeesRepository());
        const allFees = await feesService.listFees(tenantId);
        const studentFees = allFees.data.filter(f => (f as any).studentId === id);
        for (const fee of studentFees) {
          await feesService.deleteFee(fee.id, tenantId);
        }

        // Finally delete the student
        await studentService.delete(tenantId, id, user.uid);

        await logAction({
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
