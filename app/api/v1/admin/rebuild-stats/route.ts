import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { DashboardService } from "@/services/dashboard.service";
import type { TenantContext } from "@/types/api";

export const dynamic = 'force-dynamic';

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.dashboard.manage)(async (_req: Request, { tenantId }: TenantContext) => {
        const service = new DashboardService();
        const data = await service.rebuildStats(tenantId);
        return createSuccessResponse(data, { message: "Stats successfully rebuilt" });
      })
    )
  )
);
