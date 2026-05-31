import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { FeatureFlagService } from "@/services/featureFlag.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.dashboard.view)( // or a specific permission
        async (_req: Request, { tenantId }: TenantContext) => {
          const service = new FeatureFlagService();
          // Return all feature flags for the tenant
          // Actually we need a method to get all flags. We'll add one.
          // For now, just return the whole document.
          const doc = await service.getAllFlags(tenantId);
          return createApiResponse(200, doc);
        }
      )
    )
  )
);
