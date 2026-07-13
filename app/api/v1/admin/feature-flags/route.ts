import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { FeatureFlagService } from "@/services/featureFlag.service";
import type { TenantContext } from "@/types/api";

export const runtime = "nodejs";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.featureFlags.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const service = new FeatureFlagService();
        const flags = await service.getAllFlags(tenantId);
        return createSuccessResponse(flags);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.featureFlags.update)(async (req: Request, { tenantId }: TenantContext) => {
        const { feature, enabled } = await req.json();
        if (!feature || typeof enabled !== "boolean") {
          return createErrorResponse(400, "Feature name and enabled status are required");
        }
        const service = new FeatureFlagService();
        await service.setFeature(tenantId, feature, enabled);
        return createSuccessResponse(null, { message: "Feature flag updated successfully" });
      })
    )
  )
);
