export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { FeatureFlagService } from "@/services/featureFlag.service";
import type { TenantContext } from "@/types/api";

const featureFlagService = new FeatureFlagService();

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (_req: Request, { tenantId }: TenantContext) => {
      const allFlags = await featureFlagService.getAllFlags(tenantId);
      // Return only the disabled feature keys
      const disabledFeatures = Object.entries(allFlags)
        .filter(([_, enabled]) => !enabled)
        .map(([key]) => key);

      return createSuccessResponse(disabledFeatures);
    })
  )
);
