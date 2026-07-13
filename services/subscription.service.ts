import { adminDb, dbTimestamp } from '@/lib/firebase-admin';
import { PLANS, Plan } from '@/lib/config/subscription-plans';
import { AuditService } from './AuditService';
import { eventBus } from '@/lib/events/event-bus';
import { EVENTS } from '@/lib/events/event-types';
import { invalidateCache } from '@/lib/cache';

export class SubscriptionService {
  private audit = new AuditService();

  async getTenantPlan(tenantId: string): Promise<Plan> {
    const doc = await adminDb.collection("tenants").doc(tenantId).get();
    const planKey = doc.exists ? doc.data()?.plan || "free" : "free";
    return PLANS[planKey] || PLANS.free;
  }

  async canUseFeature(tenantId: string, feature: string): Promise<boolean> {
    const plan = await this.getTenantPlan(tenantId);
    return plan.features.includes(feature as any) || plan.features.includes(feature.replace('.view', '').replace('.create', '') as any);
  }

  async getPlanLimits(tenantId: string) {
    const plan = await this.getTenantPlan(tenantId);
    return { maxStudents: plan.maxStudents, maxStaff: plan.maxStaff };
  }

  async getSubscription(tenantId: string) {
    const doc = await adminDb.collection("subscriptions").doc(tenantId).get();
    if (!doc.exists) return { planId: "free", status: "active" };
    return doc.data();
  }

  async activateSubscription(tenantId: string, planId: string, userId?: string) {
    await adminDb.collection("subscriptions").doc(tenantId).set({
      tenantId,
      planId,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      updatedAt: dbTimestamp,
    }, { merge: true });

    await invalidateCache(`subscription:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "SUBSCRIPTION_ACTIVATED",
        userId,
        tenantId,
        entityType: "subscription",
        metadata: { planId },
      });
    }

    await eventBus.publish(EVENTS.SUBSCRIPTION_ACTIVATED, { tenantId, planId });
  }

  async cancelSubscription(tenantId: string, userId?: string) {
    await adminDb.collection("subscriptions").doc(tenantId).set({
      planId: "free",
      status: "canceled",
      updatedAt: dbTimestamp,
    }, { merge: true });

    await invalidateCache(`subscription:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "SUBSCRIPTION_CANCELED",
        userId,
        tenantId,
        entityType: "subscription",
      });
    }

    await eventBus.publish(EVENTS.SUBSCRIPTION_CANCELED, { tenantId });
  }

  async updateSubscription(tenantId: string, data: Record<string, any>, userId?: string) {
    await adminDb.collection("subscriptions").doc(tenantId).set({
      ...data,
      updatedAt: dbTimestamp,
    }, { merge: true });

    await invalidateCache(`subscription:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "SUBSCRIPTION_UPDATED",
        userId,
        tenantId,
        entityType: "subscription",
        metadata: data,
      });
    }

    await eventBus.publish(EVENTS.SUBSCRIPTION_UPDATED, { tenantId, ...data });
  }
}
