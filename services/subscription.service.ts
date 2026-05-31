// services/subscription.service.ts
import { adminDb } from '@/lib/firebase-admin';
import { PLANS, Plan } from '@/lib/config/subscription-plans';

export class SubscriptionService {
  /**
   * Get the current plan for a tenant.
   * Default to "free" if not set.
   */
  async getTenantPlan(tenantId: string): Promise<Plan> {
    const doc = await adminDb.collection("tenants").doc(tenantId).get();
    const planKey = doc.exists ? doc.data()?.plan || "free" : "free";
    return PLANS[planKey] || PLANS.free;
  }

  /**
   * Check if a tenant's plan allows a specific feature.
   */
  async canUseFeature(tenantId: string, feature: string): Promise<boolean> {
    const plan = await this.getTenantPlan(tenantId);
    // If the feature is a permission key, also check features array
    return plan.features.includes(feature as any) || plan.features.includes(feature.replace('.view', '').replace('.create', '') as any);
  }

  /**
   * Get plan limits for the tenant.
   */
  async getPlanLimits(tenantId: string) {
    const plan = await this.getTenantPlan(tenantId);
    return {
      maxStudents: plan.maxStudents,
      maxStaff: plan.maxStaff,
    };
  }
}
