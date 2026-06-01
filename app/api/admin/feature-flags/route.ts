import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { FeatureFlagService } from "@/services/featureFlag.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Feature } from "@/lib/features/featureFlags";   // 👈 اضافہ

const featureFlagService = new FeatureFlagService();

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.view)(async (req: Request, { tenantId }: TenantContext) => {
        const flags = await featureFlagService.getAllFlags(tenantId);
        return createApiResponse(200, flags);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.manage)(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        const { feature, enabled } = body;
        if (typeof feature !== "string" || typeof enabled !== "boolean") {
          return createApiResponse(400, null, "Invalid payload");
        }
        // Cast to Feature type (you may also validate that feature is in ALL_FEATURES)
        await featureFlagService.setFeature(tenantId, feature as Feature, enabled);
        return createApiResponse(200, { feature, enabled }, "Feature flag updated");
      })
    )
  )
);
