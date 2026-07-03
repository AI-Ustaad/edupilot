// lib/subscription.ts
import { adminDb } from "@/lib/firebase-admin";

export interface PlanLimits {
  students: number;
  staff: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { students: 50, staff: 10 },
  basic: { students: 500, staff: 50 },
  pro: { students: 2000, staff: 200 },
  enterprise: { students: 999999, staff: 999999 },
};

export async function getTenantSubscription(tenantId: string) {
  const subDoc = await adminDb.collection("subscriptions").doc(tenantId).get();
  if (!subDoc.exists) {
    return { planId: "free", status: "active", limits: PLAN_LIMITS.free };
  }
  const subData = subDoc.data() as any;
  return {
    planId: subData.planId || "free",
    status: subData.status || "active",
    limits: PLAN_LIMITS[subData.planId] || PLAN_LIMITS.free,
  };
}

export async function getTenantUsage(tenantId: string) {
  const studentsSnapshot = await adminDb.collection("students").where("tenantId", "==", tenantId).get();
  const staffSnapshot = await adminDb.collection("staff").where("tenantId", "==", tenantId).get();
  
  return {
    studentsUsed: studentsSnapshot.size,
    staffUsed: staffSnapshot.size,
  };
}

// یہ فنکشن Check کرے گا کہ نیا سٹوڈنٹ Add ہو سکتا ہے یا نہیں
export async function canAddStudent(tenantId: string): Promise<{ allowed: boolean; message?: string }> {
  const { limits } = await getTenantSubscription(tenantId);
  const { studentsUsed } = await getTenantUsage(tenantId);
  
  if (studentsUsed >= limits.students) {
    return {
      allowed: false,
      message: `You have reached the student limit (${limits.students}) of your plan. Please upgrade your plan to add more students.`
    };
  }
  return { allowed: true };
}
