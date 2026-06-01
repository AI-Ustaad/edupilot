import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
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
        withPermission(PERMISSIONS.dashboard.view)(
          async (_req: Request, { tenantId }: TenantContext) => {
            const service = new DashboardService();
            const data = await service.getDashboardData(tenantId);
            return createApiResponse(200, data);
          }
        )
      )
    )
  )
);
