import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { SettingsRepository } from "@/repositories/settings.repository";
import type { TenantContext } from "@/types/api";

export const runtime = "nodejs";

const settingsRepo = new SettingsRepository();

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const config = await settingsRepo.getGeneral(tenantId);
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
        await settingsRepo.updateGeneral(tenantId, body);
        return createSuccessResponse(null, { message: "Settings updated successfully" });
      })
    )
  )
);
