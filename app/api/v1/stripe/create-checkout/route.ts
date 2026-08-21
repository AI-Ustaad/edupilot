export const dynamic = 'force-dynamic';
import { stripe, PLANS } from "@/lib/stripe";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { SubscriptionService } from "@/services/subscription.service";
import type { TenantContext } from "@/types/api";

function isPaidPlan(plan: any): plan is { id: string; name: string; price: number; priceId: string; limits: any } {
  return plan.price > 0 && typeof plan.priceId === "string";
}

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.billing.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { planId } = await req.json();
        const plan = Object.values(PLANS).find(p => p.id === planId);
        if (!plan) return createErrorResponse(400, "Invalid plan");

        if (plan.price === 0) {
          await new SubscriptionService().activateSubscription(tenantId, plan.id, user.uid);
          return createSuccessResponse({ url: "/settings/billing?success=true" });
        }

        if (!isPaidPlan(plan)) return createErrorResponse(400, "Plan not configured");

        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [{ price: plan.priceId, quantity: 1 }],
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings/billing?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings/billing?canceled=true`,
          metadata: { tenantId, planId: plan.id },
          subscription_data: { metadata: { tenantId, planId: plan.id } },
          client_reference_id: tenantId,
        });

        return createSuccessResponse({ url: session.url });
      })
    )
  )
);
