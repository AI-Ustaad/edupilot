export const dynamic = 'force-dynamic';

import { PLANS } from "@/lib/stripe";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { SubscriptionService } from "@/services/subscription.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.subscriptions.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const service = new SubscriptionService();
        const subscription = await service.getSubscription(tenantId);
        const plan = PLANS[(subscription as any).planId as keyof typeof PLANS] || PLANS.free;
        return createSuccessResponse({ ...subscription, plan });
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.subscriptions.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { planId } = await req.json();
        if (!PLANS[planId as keyof typeof PLANS]) {
          return createErrorResponse(400, "Invalid plan");
        }
        const service = new SubscriptionService();
        await service.activateSubscription(tenantId, planId, user.uid);
        return createSuccessResponse(null, { message: "Subscription updated" });
      })
    )
  )
);
