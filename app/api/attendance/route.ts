// app/api/attendance/route.ts
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { AttendanceService } from "@/services/attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const url = new URL(req.url);
      const filters = {
        date: url.searchParams.get('date') || undefined,
        classGrade: url.searchParams.get('classGrade') || undefined,
        section: url.searchParams.get('section') || undefined,
      };

      const service = new AttendanceService(new AttendanceRepository());
      const records = await service.listAttendance(tenantId, filters);
      return createApiResponse(200, records);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const service = new AttendanceService(new AttendanceRepository());

        // اگر Array بھیجی گئی تو بلک، ورنہ سنگل
        if (Array.isArray(body)) {
          const result = await service.createBulk(body, tenantId, user.uid);
          return createApiResponse(201, result, result.message);
        } else {
          const record = await service.createSingle(body, tenantId, user.uid);
          return createApiResponse(201, record, "Attendance marked successfully");
        }
      })
    )
  )
);
