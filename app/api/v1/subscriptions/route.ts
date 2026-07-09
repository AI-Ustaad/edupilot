export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { PLANS } from "@/lib/stripe";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.subscriptions.view)(async (req: Request, context: any) => {
        const { tenantId } = context;
        const doc = await adminDb.collection("subscriptions").doc(tenantId).get();
        const subscription = doc.data() || { planId: "free", status: "active" };
        const plan = PLANS[subscription.planId as keyof typeof PLANS] || PLANS.free;
        
        return createSuccessResponse({ ...subscription, plan });
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.subscriptions.update)(async (req: Request, context: any) => {
        const { planId } = await req.json();
        const { tenantId } = context;
        
        if (!PLANS[planId as keyof typeof PLANS]) {
          return createErrorResponse(400, "Invalid plan");
        }
        
        await adminDb.collection("subscriptions").doc(tenantId).set({
          planId, status: "active", updatedAt: new Date(),
        }, { merge: true });
        
        return createSuccessResponse(null, { message: "Subscription updated" });
      })
    )
  )
);
