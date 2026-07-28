export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { AcademicYearService } from "@/services/academic-year.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const service = new AcademicYearService();
      const data = await service.findAll(tenantId);
      return createSuccessResponse(data);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.academicYear.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const { name, startDate, endDate, isCurrent } = body;
        if (!name || !startDate || !endDate) {
          return createErrorResponse(400, "Missing fields");
        }

        const service = new AcademicYearService();
        const id = await service.create({ name, startDate, endDate, isCurrent: !!isCurrent, tenantId } as any, tenantId, user.uid);

        return createApiResponse(201, { id });
      })
    )
  )
);
