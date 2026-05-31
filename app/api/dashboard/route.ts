import { withAuth, withTenant, withErrorHandler, withRateLimit } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { DashboardService } from "@/services/dashboard.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const GET = withErrorHandler(
  withAuth(
    withRateLimit()(   // <-- Default apiRateLimit (100 req/min)
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
