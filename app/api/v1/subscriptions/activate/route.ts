export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { SubscriptionService } from "@/services/subscription.service";
import type { TenantContext } from "@/types/api";

const FREE_PLAN_ID = "free";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.subscriptions.activate)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { planId } = await req.json();

        if (planId !== FREE_PLAN_ID) {
          return createErrorResponse(403, "Paid plans must be activated through the billing checkout flow");
        }

        const service = new SubscriptionService();
        await service.activateSubscription(tenantId, planId, user.uid);
        return createSuccessResponse(null, { message: "Activated" });
      })
    )
  )
);
