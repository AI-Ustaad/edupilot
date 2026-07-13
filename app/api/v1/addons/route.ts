export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import { AddonsRepository } from "@/repositories/addons.repository";
import type { TenantContext } from "@/types/api";

const addonsRepo = new AddonsRepository();

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const addons = await addonsRepo.getAddons(tenantId);
      return createApiResponse(200, addons);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.update)(async (req: Request, { tenantId }: TenantContext) => {
        const addons = await req.json();
        await addonsRepo.saveAddons(tenantId, addons);
        return createSuccessResponse(null, { message: "Addons updated" });
      })
    )
  )
);
