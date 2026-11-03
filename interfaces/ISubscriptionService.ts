// interfaces/ISubscriptionService.ts
import type { Plan } from "@/lib/config/subscription-plans";
import type { Subscription } from "@/repositories/subscription.repository";

export interface ISubscriptionService {
  getTenantPlan(tenantId: string): Promise<Plan>;
  canUseFeature(tenantId: string, feature: string): Promise<boolean>;
  getPlanLimits(tenantId: string): Promise<{ maxStudents: number; maxStaff: number }>;
  getSubscription(tenantId: string): Promise<any>;
  findByStripeSubscriptionId?(stripeSubscriptionId: string): Promise<Subscription | null>;
  findByStripeCustomerId?(stripeCustomerId: string): Promise<Subscription | null>;
  activateSubscription(tenantId: string, planId: string, userId?: string, extraData?: Partial<Subscription>): Promise<void>;
  cancelSubscription(tenantId: string, userId?: string): Promise<void>;
  updateSubscription(tenantId: string, data: Record<string, any>, userId?: string): Promise<void>;
}
