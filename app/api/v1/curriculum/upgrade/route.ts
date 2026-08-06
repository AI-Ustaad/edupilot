// app/api/v1/curriculum/upgrade/route.ts
export const dynamic = "force-dynamic";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { configurationService } from "@/services/configuration.service";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

// 1. Check if upgrade is available
export const GET = withErrorHandler(
  withAuth(
    withTenant(async (_req: Request, { tenantId }: TenantContext) => {
      const upgradeStatus = await configurationService.checkForUpgrades(tenantId);
      return createSuccessResponse(upgradeStatus);
    })
  )
);

// 2. Apply the upgrade
export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const { newVersionId } = await req.json();
      const updatedConfig = await configurationService.upgradeCurriculum(tenantId, newVersionId, user.uid);
      return createSuccessResponse({ success: true }, { message: "Curriculum upgraded successfully!" });
    })
  )
);
