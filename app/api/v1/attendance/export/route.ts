export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { AttendanceService } from "@/services/attendance.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.attendance.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const attendanceService = new AttendanceService();
        const records = await attendanceService.listAttendance(tenantId);

        const headers = ["Student Name", "Roll No", "Class", "Section", "Date", "Status"];
        const csvContent = [
          headers.join(","),
          ...records.map((r) => [
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
