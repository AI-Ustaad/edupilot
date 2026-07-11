export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { AttendanceService } from "@/services/attendance.service";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import { GetAttendanceQuerySchema } from "@/validators/attendance";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.attendance.view)(async (req: Request, { tenantId }: TenantContext) => {
        const url = new URL(req.url);
        const queryParams = {
          date: url.searchParams.get("date") || undefined,
          classGrade: url.searchParams.get("classGrade") || undefined,
          section: url.searchParams.get("section") || undefined,
          studentId: url.searchParams.get("studentId") || undefined,
          page: url.searchParams.get("page") || undefined,
          limit: url.searchParams.get("limit") || undefined,
        };

        const validation = GetAttendanceQuerySchema.safeParse(queryParams);
        if (!validation.success) {
          return createSuccessResponse([]);
        }

        const { page, limit, ...filters } = validation.data;
        const service = new AttendanceService();
        const records = await service.listAttendance(tenantId, filters);

        // Pagination
        if (page && limit) {
          const pageNum = parseInt(page, 10);
          const limitNum = parseInt(limit, 10);
          const start = (pageNum - 1) * limitNum;
          const end = start + limitNum;
          return createSuccessResponse({
            data: records.slice(start, end),
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: records.length,
              totalPages: Math.ceil(records.length / limitNum),
            },
          });
        }

        return createSuccessResponse(records);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.attendance.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const service = new AttendanceService();

        if (Array.isArray(body)) {
          const result = await service.createBulk(body, tenantId, user.uid);
          return createApiResponse(201, result);
        }

        const record = await service.createSingle(body, tenantId, user.uid);
        return createApiResponse(201, record, "Attendance saved");
      })
    )
  )
);
