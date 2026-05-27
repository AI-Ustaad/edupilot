// lib/subscription.ts
import { adminDb } from "@/lib/firebase-admin";

export interface PlanLimits {
  students: number;
  staff: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { students: 50, staff: 10 },
  basic: { students: 200, staff: 50 },
  pro: { students: 1000, staff: 200 },
  enterprise: { students: 9999, staff: 9999 },
};

export async function getPlanLimits(tenantId: string): Promise<PlanLimits> {
  const subDoc = await adminDb.collection("subscriptions").doc(tenantId).get();
  const sub = subDoc.data();
  const planId = sub?.planId || "free";
  return PLAN_LIMITS[planId] || PLAN_LIMITS.free;
}

export async function isSubscriptionValid(tenantId: string): Promise<{ valid: boolean; message?: string }> {
  // ڈیمو اسکولز کے لیے خصوصی استثنا
  const demoTenants = (process.env.DEMO_TENANTS || "").split(",");
  if (demoTenants.includes(tenantId)) {
    return { valid: true };
  }

  const subDoc = await adminDb.collection("subscriptions").doc(tenantId).get();
  const sub = subDoc.data();

  if (!sub) {
    return { valid: true };  // فری پلان ہمیشہ فعال
  }

  if (sub.status !== "active") {
    return { valid: false, message: "Your subscription is inactive. Please upgrade." };
  }

  if (sub.trialEndsAt) {
    const trialEnd = sub.trialEndsAt.toDate ? sub.trialEndsAt.toDate() : new Date(sub.trialEndsAt);
    if (new Date() > trialEnd) {
      if (sub.planId === "free" || !sub.planId) {
        return { valid: false, message: "Your free trial has ended. Please select a plan." };
      }
    }
  }

  return { valid: true };
}
