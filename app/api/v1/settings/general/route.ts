import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { SettingsGeneralService } from "@/services/settings-general.service";
import type { TenantContext } from "@/types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const service = new SettingsGeneralService();
        const config = await service.getGeneral(tenantId);
        return createSuccessResponse(config || {});
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.update)(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        const service = new SettingsGeneralService();
        await service.updateGeneral(tenantId, body);
        return createSuccessResponse(null, { message: "Settings updated successfully" });
      })
    )
  )
);
