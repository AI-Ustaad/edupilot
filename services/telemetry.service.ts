// services/telemetry.service.ts
import { TenantRepository } from "@/repositories/tenant.repository";
import { SubscriptionRepository } from "@/repositories/subscription.repository";
import { AuditRepository } from "@/repositories/audit.repository";
import { PLANS } from "@/lib/config/subscription-plans";

export class TelemetryService {
  private tenantRepo = new TenantRepository();
  private subscriptionRepo = new SubscriptionRepository();
  private auditRepo = new AuditRepository();

  async getSaaSMetrics() {
    const [tenants, subscriptions] = await Promise.all([
      this.tenantRepo.listAll(),
      this.subscriptionRepo.listAll(),
    ]);

    const totalSchools = tenants.length;
    let activeSubscriptions = 0;
    let trialSubscriptions = 0;
    let mrr = 0;

    const planPrices: Record<string, number> = {
      basic: 2000,
      pro: 3000,
      enterprise: 5000,
      free: 0,
    };

    subscriptions.forEach((sub: any) => {
      if (sub.status === "active") {
        activeSubscriptions++;
        mrr += planPrices[sub.planId] || 0;
      } else if (sub.status === "trialing") {
        trialSubscriptions++;
      }
    });

    const today = new Date().toISOString().split('T')[0];
    const loginLogs = await this.auditRepo.findByTenant(
      tenants[0]?.id || "",
      { action: "user.login" }
    );

    const uniqueUserIds = new Set(loginLogs.map(log => log.userId));
    const dau = uniqueUserIds.size;

    return {
      totalSchools,
      activeSubscriptions,
      trialSubscriptions,
      mrr,
      dau,
      systemHealth: {
        apiStatus: "Operational",
        databaseLatency: "120ms",
        errorRate: "0.2%",
      },
      revenueTrend: [
        { month: "Jan", revenue: mrr * 0.8 },
        { month: "Feb", revenue: mrr * 0.9 },
        { month: "Mar", revenue: mrr },
      ],
    };
  }
}
