import { SubscriptionRepository } from "@/repositories/subscription.repository";
import { TenantRepository } from "@/repositories/tenant.repository";
import { FeatureFlagRepository } from "@/repositories/feature-flag.repository";
import { InvoiceRepository } from "@/repositories/invoice.repository";
import { AiUsageRepository } from "@/repositories/ai-usage.repository";
import { DashboardStatsRepository } from "@/repositories/dashboard-stats.repository";
import { AuditRepository } from "@/repositories/audit.repository";
import { JobRepository } from "@/repositories/job.repository";
import { ChatRepository } from "@/repositories/chat.repository";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { MenuRepository } from "@/repositories/menu.repository";
import { AddonsRepository } from "@/repositories/addons.repository";

export const REPOSITORIES = {
  subscription: SubscriptionRepository,
  tenant: TenantRepository,
  featureFlag: FeatureFlagRepository,
  invoice: InvoiceRepository,
  aiUsage: AiUsageRepository,
  dashboardStats: DashboardStatsRepository,
  audit: AuditRepository,
  job: JobRepository,
  chat: ChatRepository,
  configuration: ConfigurationRepository,
  menu: MenuRepository,
  addons: AddonsRepository,
} as const;
