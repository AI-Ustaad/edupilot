// interfaces/ITenantService.ts
import type { SchoolSetupInput } from "@/services/tenant.service";

export interface TenantRepairResult {
  repaired: boolean;
  reason?: string;
}

export interface ITenantService {
  setupSchool(input: SchoolSetupInput): Promise<{ tenantId: string }>;
  provisionOrRepairTenant(tenantId: string, userId: string): Promise<TenantRepairResult>;
}
