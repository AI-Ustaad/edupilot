import type { MasterSchoolConfiguration } from "@/types/configuration";
import type { SchoolConfigurationViewModel } from "@/types/viewmodels/school-configuration.viewmodel";
import type { ConfigurationHistoryViewModel } from "@/types/viewmodels/configuration-history.viewmodel";
import type { ConfigurationLoadResult } from "@/types/configuration/status";
import type { TenantMetadata } from "@/lib/configuration/constants";

export interface IConfigurationRepository {
  getConfiguration(tenantId: string): Promise<MasterSchoolConfiguration | null>;
  getConfigurationById(tenantId: string, docId: string): Promise<MasterSchoolConfiguration | null>;
  saveConfiguration(tenantId: string, config: MasterSchoolConfiguration): Promise<void>;
  updateConfiguration(tenantId: string, data: Partial<MasterSchoolConfiguration>): Promise<MasterSchoolConfiguration>;
  publishConfiguration(tenantId: string, config: MasterSchoolConfiguration, userId: string): Promise<MasterSchoolConfiguration>;
  deleteConfiguration(tenantId: string): Promise<void>;
  configurationExists(tenantId: string): Promise<boolean>;
  loadCachedConfiguration(tenantId: string): Promise<MasterSchoolConfiguration | null>;
  getConfigurationHistory(tenantId: string, limit?: number): Promise<MasterSchoolConfiguration[]>;
  getTenantMetadata(tenantId: string): Promise<TenantMetadata | null>;
  updateTenantMetadata(tenantId: string, data: Partial<TenantMetadata>): Promise<void>;
}
