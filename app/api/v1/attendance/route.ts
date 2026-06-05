export const dynamic = 'force-dynamic';
import { invalidateCache } from "@/lib/cache";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { AttendanceService } from "@/services/attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { standardRateLimit } from "@/lib/ratelimit";
import { withRateLimit } from "@/route-helpers";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.attendance.view)(async (req: Request, { tenantId }: TenantContext) => {
        const url = new URL(req.url);
        const filters = {
          date: url.searchParams.get('date') || undefined,
          classGrade: url.searchParams.get('classGrade') || undefined,
          section: url.searchParams.get('section') || undefined,
        };
        const service = new AttendanceService(new AttendanceRepository());
        const records = await service.listAttendance(tenantId, filters);
    await invalidateCache(`dashboard:${tenantId}`);
        return createApiResponse(200, records);
      })
    )
  )
);

export const POST = withRateLimit(standardRateLimit)(
  withErrorHandler(
    withAuth(
      withTenant(
        withPermission(PERMISSIONS.attendance.create)(async (req: Request, { tenantId, user }: TenantContext) => {
          const body = await req.json();
          const service = new AttendanceService(new AttendanceRepository());
          if (Array.isArray(body)) {
            const result = await service.createBulk(body, tenantId, user.uid);
    await invalidateCache(`dashboard:${tenantId}`);
            return createApiResponse(201, result, result.message);
          } else {
            const record = await service.createSingle(body, tenantId, user.uid);
    await invalidateCache(`dashboard:${tenantId}`);
            return createApiResponse(201, record, "Attendance marked successfully");
          }
        })
      )
    )
  )
);
