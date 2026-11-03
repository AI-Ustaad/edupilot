import { PLANS, Plan } from '@/lib/config/subscription-plans';
import { AuditService } from './AuditService';
import { eventBus } from '@/lib/events';
import { EVENTS } from '@/lib/events/event-types';
import { invalidateCache } from '@/lib/cache';
import { SubscriptionRepository, Subscription } from "@/repositories/subscription.repository";
import type { ISubscriptionService } from "@/interfaces/ISubscriptionService";

export class SubscriptionService implements ISubscriptionService {
  private audit = new AuditService();
  private subscriptionRepo = new SubscriptionRepository();

  async getTenantPlan(tenantId: string): Promise<Plan> {
    const subscription = await this.subscriptionRepo.findByTenant(tenantId);
    const planKey = subscription?.planId || "free";
    return PLANS[planKey] || PLANS.free;
  }

  async canUseFeature(tenantId: string, feature: string): Promise<boolean> {
    const plan = await this.getTenantPlan(tenantId);
    return plan.features.includes(feature as any) || plan.features.includes(feature.replace('.view', '').replace('.create', '') as any);
  }

  async getPlanLimits(tenantId: string) {
    const subscription = await this.subscriptionRepo.findByTenant(tenantId);
    const plan = await this.getTenantPlan(tenantId);
    return {
      maxStudents: subscription?.maxStudents ?? plan.maxStudents,
      maxStaff: subscription?.maxStaff ?? plan.maxStaff,
    };
  }

  async getSubscription(tenantId: string): Promise<Subscription | { planId: string; status: string; maxStudents: number; maxStaff: number }> {
    const subscription = await this.subscriptionRepo.findByTenant(tenantId);
    if (!subscription) return { planId: "free", status: "active", maxStudents: PLANS.free.maxStudents, maxStaff: PLANS.free.maxStaff };
    return subscription;
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    return this.subscriptionRepo.findByStripeSubscriptionId(stripeSubscriptionId);
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
    return this.subscriptionRepo.findByStripeCustomerId(stripeCustomerId);
  }

  async activateSubscription(
    tenantId: string,
    planId: string,
    userId?: string,
    extraData: Partial<Subscription> = {}
  ) {
    await this.subscriptionRepo.activate(tenantId, planId, userId, extraData);

    await invalidateCache(`subscription:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "SUBSCRIPTION_ACTIVATED",
        userId,
        tenantId,
        entityType: "subscription",
        metadata: { planId, ...extraData },
      });
    }

    await eventBus.publish(EVENTS.SUBSCRIPTION_ACTIVATED, { tenantId, planId, ...extraData }, tenantId);
  }

  async cancelSubscription(tenantId: string, userId?: string) {
    await this.subscriptionRepo.cancel(tenantId, userId);

    await invalidateCache(`subscription:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "SUBSCRIPTION_CANCELED",
        userId,
        tenantId,
        entityType: "subscription",
      });
    }

    await eventBus.publish(EVENTS.SUBSCRIPTION_CANCELED, { tenantId }, tenantId);
  }

  async updateSubscription(tenantId: string, data: Record<string, any>, userId?: string) {
    await this.subscriptionRepo.updateSubscription(tenantId, data);

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

    await eventBus.publish(EVENTS.SUBSCRIPTION_UPDATED, { tenantId, ...data }, tenantId);
  }
}
