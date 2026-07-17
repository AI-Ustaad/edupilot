export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { DashboardService } from "@/services/dashboard.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { withRateLimit } from "@/route-helpers";
import { standardRateLimit } from "@/lib/ratelimit";   // 👈 import the limiter

export const GET = withErrorHandler(
  withAuth(
    withRateLimit(standardRateLimit)(       // 👈 pass the limiter
      withTenant(
        withPermission(PERMISSIONS.analytics.view)(
          async (_req: Request, { tenantId }: TenantContext) => {
            const service = new DashboardService();
            const data = await service.getDashboardData(tenantId);
            return createSuccessResponse(data);
          }
        )
      )
    )
  )
);
