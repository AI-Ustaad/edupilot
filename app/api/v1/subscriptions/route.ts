export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { PLANS } from "@/lib/stripe";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createApiResponse } from "@/lib/response/apiResponse";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.subscriptions.view)(async (req: Request, context: any) => {
        const { tenantId } = context;
        const doc = await adminDb.collection("subscriptions").doc(tenantId).get();
        const subscription = doc.data() || { planId: "free", status: "active" };
        const plan = PLANS[subscription.planId as keyof typeof PLANS] || PLANS.free;
        
        return NextResponse.json(createApiResponse(200, { ...subscription, plan }));
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
          return NextResponse.json(createApiResponse(400, null, "Invalid plan"), { status: 400 });
        }
        
        await adminDb.collection("subscriptions").doc(tenantId).set({
          planId, status: "active", updatedAt: new Date(),
        }, { merge: true });
        
        return NextResponse.json(createApiResponse(200, null, "Subscription updated"));
      })
    )
  )
);
