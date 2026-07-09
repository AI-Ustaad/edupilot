export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.subscriptions.activate)(async (req: Request, context: any) => {
        const { planId } = await req.json();
        const { tenantId } = context;
        
        await adminDb.collection("subscriptions").doc(tenantId).set({
          planId,
          status: "active",
          currentPeriodStart: new Date(),
          PeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        }, { merge: true });
        
        return createSuccessResponse(null, { message: "Activated" });
      })
    )
  )
);
