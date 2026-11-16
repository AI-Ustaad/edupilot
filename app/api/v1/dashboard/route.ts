export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { DashboardService } from "@/services/dashboard.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { withRateLimit } from "@/route-helpers";
import { standardRateLimit } from "@/lib/ratelimit";

export const GET = withErrorHandler(
  withAuth(
    withRateLimit(standardRateLimit)(
      withTenant(
        withPermission(PERMISSIONS.analytics.view)(
          async (req: Request, context: TenantContext) => {
            const tenantId = context?.tenantId || (context as any)?.user?.tenantId || "default";
            const url = new URL(req.url);
            const clientDate = url.searchParams.get("date") || undefined;
            const service = new DashboardService();
            const data = await service.getDashboardData(tenantId, clientDate);
            return createSuccessResponse(data);
          }
        )
      )
    )
  )
);
