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
  // ڈیمو اسکول کے لیے خصوصی استثنا (اختیاری)
  // اگر tenantId کسی مخصوص لسٹ میں ہے تو ہمیشہ valid مان لیں
  const demoTenants = (process.env.DEMO_TENANTS || "").split(",");
  if (demoTenants.includes(tenantId)) {
    return { valid: true };
  }

  const subDoc = await adminDb.collection("subscriptions").doc(tenantId).get();
  const sub = subDoc.data();

  // اگر کوئی سبسکرپشن دستاویز ہی نہیں ہے تو فری پلان تصور کریں
  if (!sub) {
    // فری پلان ہمیشہ فعال رہے گا
    return { valid: true };
  }

  // اگر status فعال نہیں ہے تو بلاک کریں
  if (sub.status !== "active") {
    return { valid: false, message: "Your subscription is inactive. Please upgrade." };
  }

  // اگر آزمائشی مدت ختم ہو چکی ہو اور پلان "free" ہے تو ختم کر دیں
  if (sub.trialEndsAt) {
    const trialEnd = sub.trialEndsAt.toDate ? sub.trialEndsAt.toDate() : new Date(sub.trialEndsAt);
    if (new Date() > trialEnd) {
      if (sub.planId === "free" || !sub.planId) {
        return { valid: false, message: "Your free trial has ended. Please select a plan." };
      }
    }
  }

  // پلان کی حدود چیک کریں (بعد میں استعمال کے لیے)
  return { valid: true };
}
