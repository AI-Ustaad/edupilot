import type { ConfigurationHealthResult } from "@/types/configuration/status";

export interface IConfigurationHealthService {
  checkHealth(tenantId: string): Promise<ConfigurationHealthResult>;
}
