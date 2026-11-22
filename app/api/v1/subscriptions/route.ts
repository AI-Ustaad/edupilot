export const dynamic = 'force-dynamic';

import { PLANS } from "@/lib/stripe";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { SubscriptionService } from "@/services/subscription.service";
import { adminDb } from "@/lib/firebase-admin";
import type { TenantContext } from "@/types/api";

const FREE_PLAN_ID = "free";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.subscriptions.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const service = new SubscriptionService();
        const subscription = await service.getSubscription(tenantId);
        const plan = PLANS[(subscription as any).planId as keyof typeof PLANS] || PLANS.free;

        let studentCount = 0;
        let staffCount = 0;
        let aiCalls = 0;

        try {
          const startOfMonth = new Date();
          startOfMonth.setUTCDate(1);
          startOfMonth.setUTCHours(0, 0, 0, 0);

          const [studentsSnap, staffSnap, aiSnap] = await Promise.all([
            adminDb.collection("students").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any)),
            adminDb.collection("staff").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any)),
            adminDb.collection("ai_usage").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any)),
          ]);

          studentCount = (studentsSnap.docs || []).filter((d: any) => !d.data()?.deleted).length;
          staffCount = (staffSnap.docs || []).filter((d: any) => !d.data()?.deleted && d.data()?.status !== "terminated").length;
          
          // Reconcile current calendar month successful AI calls
          const rawAiDocs = aiSnap.docs || [];
          const currentMonthDocs = rawAiDocs.filter((d: any) => {
            const data = d.data() || {};
            if (data.success === false) return false;
            let dateVal: Date | null = null;
            if (data.createdAt?.toDate) dateVal = data.createdAt.toDate();
            else if (data.createdAt) dateVal = new Date(data.createdAt);
            else if (data.timestamp?.toDate) dateVal = data.timestamp.toDate();
            else if (data.timestamp) dateVal = new Date(data.timestamp);
            if (!dateVal || isNaN(dateVal.getTime())) return true;
            return dateVal >= startOfMonth;
          });
          aiCalls = currentMonthDocs.length;
        } catch {
          studentCount = 0;
          staffCount = 0;
          aiCalls = 0;
        }

        const isDemoSchool = tenantId === "tenant_ghs_sahiwal" || tenantId?.includes("ghs_sahiwal");
        const resolvedLimits = {
          ...(subscription as any)?.limits,
          aiMonthlyQuota: isDemoSchool ? 500 : ((subscription as any)?.limits?.aiMonthlyQuota || plan.maxAiQuota || 50),
          maxAiQuota: isDemoSchool ? 500 : ((subscription as any)?.limits?.maxAiQuota || plan.maxAiQuota || 50),
        };

        return createSuccessResponse({
          ...subscription,
          limits: resolvedLimits,
          plan,
          usage: {
            students: studentCount,
            staff: staffCount,
            aiCalls,
          },
        });
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

        if (planId !== FREE_PLAN_ID) {
          return createErrorResponse(403, "Paid plans must be activated through the billing checkout flow");
        }

        const service = new SubscriptionService();
        await service.activateSubscription(tenantId, planId, user.uid);
        return createSuccessResponse(null, { message: "Subscription updated" });
      })
    )
  )
);
