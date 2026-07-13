export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import { MenuRepository } from "@/repositories/menu.repository";
import type { TenantContext } from "@/types/api";

const menuRepo = new MenuRepository();

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const menu = await menuRepo.getMenu(tenantId);
      return createApiResponse(200, menu);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.menu.update)(async (req: Request, { tenantId }: TenantContext) => {
        const menu = await req.json();
        await menuRepo.saveMenu(tenantId, menu);
        return createSuccessResponse(null, { message: "Menu saved" });
      })
    )
  )
);
