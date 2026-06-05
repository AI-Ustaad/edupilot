export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { FeatureFlagService } from "@/services/featureFlag.service";
import { SubscriptionService } from "@/services/subscription.service";
import { ALL_FEATURES } from "@/lib/features/featureFlags";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.dashboard.view)(
        async (_req: Request, { tenantId }: TenantContext) => {
          const ffService = new FeatureFlagService();
          const subService = new SubscriptionService();

          // 1. Plan allowed features
          const plan = await subService.getTenantPlan(tenantId);
          const planAllowedFeatures = plan.features;

          // 2. Manual overrides
          const manualFlags = await ffService.getAllFlags(tenantId);

          // 3. Build effective flags: disabled if plan doesn't allow OR manual off
          const effectiveFlags: Record<string, boolean> = {};
          for (const feat of Object.values(ALL_FEATURES)) {
            const planAllows = planAllowedFeatures.includes(feat as any);
            const manualOverride = manualFlags[feat]; // true / false / undefined
            effectiveFlags[feat] = planAllows && (manualOverride !== false);
          }

          return createApiResponse(200, { features: effectiveFlags });
        }
      )
    )
  )
);
