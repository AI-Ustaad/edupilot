import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { DashboardService } from "@/services/dashboard.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.dashboard.view)(
        async (_req: Request, { tenantId }: TenantContext) => {
          const service = new DashboardService();
          const data = await service.getDashboardData(tenantId);
          // صرف data پاس کریں – createApiResponse خود { success: true, data } بنائے گا
          return createApiResponse(200, data);
        }
      )
    )
  )
);
