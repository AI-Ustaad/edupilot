// app/api/parents/attendance/route.ts
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { ParentsService } from "@/services/parents.service";
import { ParentsRepository } from "@/repositories/parents.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { AttendanceService } from "@/services/attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["parent"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const url = new URL(req.url);
        const studentId = url.searchParams.get('studentId');
        const date = url.searchParams.get('date');

        // والدین کا یہ بچہ ہے یا نہیں؟
        const parentService = new ParentsService(new ParentsRepository(), new StudentRepository());
        if (studentId) {
          const isParent = await parentService.isParentOf(user.uid, studentId, tenantId);
          if (!isParent) {
            return createApiResponse(403, null, "Access denied");
          }
        }

        const attendanceService = new AttendanceService(new AttendanceRepository());
        const filters: any = {};
        if (date) filters.date = date;
        // اگر studentId نہیں دیا تو صرف والدین کے بچوں کی حاضری دکھائیں
        if (!studentId) {
          const childIds = await parentService.getChildIds(user.uid, tenantId);
          // تاریخ کے فلٹر کے ساتھ سب بچوں کی حاضری
          const all = await attendanceService.listAttendance(tenantId, filters);
          const filtered = all.filter(r => childIds.includes((r as any).studentId));
          return createApiResponse(200, filtered);
        }

        const records = await attendanceService.listAttendance(tenantId, { ...filters });
        return createApiResponse(200, records.filter(r => (r as any).studentId === studentId));
      })
    )
  )
);
