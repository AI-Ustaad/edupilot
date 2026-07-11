export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { AttendanceService } from "@/services/attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.attendance.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const attendanceService = new AttendanceService(new AttendanceRepository());
        const records = await attendanceService.listAttendance(tenantId);

        const headers = ["Student Name", "Roll No", "Class", "Section", "Date", "Status"];
        const csvContent = [
          headers.join(","),
          ...records.map((r: any) => [
            `"${r.studentName || ""}"`,
            `"${r.rollNumber || ""}"`,
            `"${r.classGrade || ""}"`,
            `"${r.section || ""}"`,
            `"${r.date || ""}"`,
            `"${r.status || ""}"`,
          ].join(","))
        ].join("\n");

        return new Response(csvContent, {
          status: 200,
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="attendance_${tenantId}.csv"`,
          },
        });
      })
    )
  )
);
