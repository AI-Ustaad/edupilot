export const dynamic = 'force-dynamic';
import { getSessionUser } from "@/lib/auth/auth-server";
import { stripe, PLANS } from "@/lib/stripe";
import { withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";

function isPaidPlan(plan: any): plan is { id: string; name: string; price: number; priceId: string; limits: any } {
  return plan.price > 0 && typeof plan.priceId === "string";
}

export const POST = withErrorHandler(async (req: Request) => {
  const user = await getSessionUser();
  if (!user?.tenantId) return createErrorResponse(401, "Unauthorized");

  const { planId } = await req.json();
  const plan = Object.values(PLANS).find(p => p.id === planId);
  if (!plan) return createErrorResponse(400, "Invalid plan");

  if (plan.price === 0) {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subscriptions/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan.id, tenantId: user.tenantId }),
    });
    return createSuccessResponse({ url: "/settings/billing?success=true" });
  }

  if (!isPaidPlan(plan)) return createErrorResponse(400, "Plan not configured");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings/billing?canceled=true`,
    metadata: { tenantId: user.tenantId, planId: plan.id },
    client_reference_id: user.tenantId,
  });

  return createSuccessResponse({ url: session.url });
});
