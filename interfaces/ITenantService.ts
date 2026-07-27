// interfaces/ITenantService.ts
import type { SchoolSetupInput } from "@/services/tenant.service";

export interface ITenantService {
  setupSchool(input: SchoolSetupInput): Promise<{ tenantId: string }>;
}
