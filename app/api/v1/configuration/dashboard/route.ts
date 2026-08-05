export const dynamic = "force-dynamic";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { configurationDashboardService } from "@/services/configuration-dashboard.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (_req: Request, context: TenantContext) => {
      const { tenantId } = context;
      const metrics = await configurationDashboardService.getDashboardMetrics(
        tenantId
      );
      return createSuccessResponse(metrics);
    })
  )
);