// interfaces/ISubscriptionService.ts
import type { Plan } from "@/lib/config/subscription-plans";

export interface ISubscriptionService {
  getTenantPlan(tenantId: string): Promise<Plan>;
  canUseFeature(tenantId: string, feature: string): Promise<boolean>;
  getPlanLimits(tenantId: string): Promise<{ maxStudents: number; maxStaff: number }>;
  getSubscription(tenantId: string): Promise<any>;
  activateSubscription(tenantId: string, planId: string, userId?: string): Promise<void>;
  cancelSubscription(tenantId: string, userId?: string): Promise<void>;
  updateSubscription(tenantId: string, data: Record<string, any>, userId?: string): Promise<void>;
}
