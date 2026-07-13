export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { SubscriptionService } from "@/services/subscription.service";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.subscriptions.activate)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { planId } = await req.json();
        const service = new SubscriptionService();
        await service.activateSubscription(tenantId, planId, user.uid);
        return createSuccessResponse(null, { message: "Activated" });
      })
    )
  )
);
