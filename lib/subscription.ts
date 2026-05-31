// lib/subscription.ts
import { adminDb } from "@/lib/firebase-admin";
import { PLANS } from "@/lib/config/subscription-plans";

export async function getPlanLimits(tenantId: string) {
  const doc = await adminDb.collection("tenants").doc(tenantId).get();
  const planKey = doc.exists ? doc.data()?.plan || "free" : "free";
  const plan = PLANS[planKey] || PLANS.free;
  return {
    students: plan.maxStudents,
    staff: plan.maxStaff,
  };
}

export async function isSubscriptionValid(tenantId: string) {
  return { valid: true, message: "" };
}
