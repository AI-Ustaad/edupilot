export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import { AddonsService } from "@/services/addons.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const service = new AddonsService();
      const addons = await service.getAddons(tenantId);
      return createApiResponse(200, addons);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.update)(async (req: Request, { tenantId }: TenantContext) => {
        const addons = await req.json();
        const service = new AddonsService();
        await service.saveAddons(tenantId, addons);
        return createSuccessResponse(null, { message: "Addons updated" });
      })
    )
  )
);
