export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { AcademicYearRepository } from "@/repositories/academic-year.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const repo = new AcademicYearRepository();
      const data = await repo.findAllByTenant(tenantId);
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

        const repo = new AcademicYearRepository();

        if (isCurrent) {
          await repo.setCurrent("", tenantId); // will unset all first
        }

        const id = await repo.create({ name, startDate, endDate, isCurrent: !!isCurrent, tenantId, createdBy: user.uid } as any, tenantId);

        if (isCurrent) {
          // Re-set the new doc as current after bulk unset
          await repo.setCurrent(id, tenantId);
        }

        return createApiResponse(201, { id });
      })
    )
  )
);
