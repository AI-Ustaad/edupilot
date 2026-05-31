// lib/subscription.ts
import { adminDb } from "@/lib/firebase-admin";
import { PLANS } from "@/lib/config/subscription-plans"; // our new plans

/**
 * Return plan limits for a tenant (max students, max staff).
 */
export async function getPlanLimits(tenantId: string) {
  const doc = await adminDb.collection("tenants").doc(tenantId).get();
  const planKey = doc.exists ? doc.data()?.plan || "free" : "free";
  const plan = PLANS[planKey] || PLANS.free;
  return {
    students: plan.maxStudents,
    staff: plan.maxStaff,
  };
}

/**
 * Check if the tenant's subscription is still valid.
 * For now, always return true (all tenants are considered active).
 * You can enhance this later with actual Stripe integration.
 */
export async function isSubscriptionValid(tenantId: string) {
  // TODO: implement real subscription validation
  return { valid: true, message: "" };
}
