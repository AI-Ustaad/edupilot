import { adminDb } from "@/lib/firebase-admin";
import { PLANS } from "@/lib/stripe";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const doc = await adminDb.collection("subscriptions").doc(tenantId).get();
      const subscription = doc.data() || { planId: "free", status: "active" };
      const plan = PLANS[subscription.planId as keyof typeof PLANS] || PLANS.free;
      return createApiResponse(200, { ...subscription, plan });
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const { planId } = await req.json();
        if (!PLANS[planId as keyof typeof PLANS]) {
          return createApiResponse(400, null, "Invalid plan");
        }
        await adminDb.collection("subscriptions").doc(tenantId).set({
          planId, status: "active", updatedAt: new Date(),
        }, { merge: true });
        return createApiResponse(200, null, "Subscription updated");
      })
    )
  )
);
