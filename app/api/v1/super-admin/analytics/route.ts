export const dynamic = 'force-dynamic';
import { withAuth, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { AnalyticsService } from "@/services/analytics.service";

export const GET = withErrorHandler(
  withAuth(async (_req: Request, context: any) => {
    const user = context?.user;
    if (!user || (user.role !== "super_admin" && user.role !== "superAdmin")) {
      return createErrorResponse(403, "Forbidden: Super Admin access required");
    }

    const service = new AnalyticsService();
    const data = await service.getAllTenantsAnalytics();
    return createSuccessResponse({ tenants: data });
  })
);
