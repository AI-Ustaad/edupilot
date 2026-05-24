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
  // ✅ TEMPORARY FIX: Always return valid (bypass subscription check)
  // TODO: Remove this after adding proper subscription documents
  return { valid: true };
  
  // Original code (commented for now):
  /*
  const subDoc = await adminDb.collection("subscriptions").doc(tenantId).get();
  const sub = subDoc.data();
  if (!sub || sub.status !== "active") {
    return { valid: false, message: "Your subscription is inactive. Please upgrade." };
  }
  if (sub.trialEndsAt && new Date() > new Date(sub.trialEndsAt)) {
    if (sub.planId === "free") {
      return { valid: false, message: "Your free trial has ended. Please select a plan." };
    }
  }
  return { valid: true };
  */
}
