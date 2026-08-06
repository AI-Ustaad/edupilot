import type { MasterSchoolConfiguration } from "@/types/configuration";
import type { SchoolConfigurationViewModel } from "@/types/viewmodels/school-configuration.viewmodel";
import type { ConfigurationHistoryViewModel } from "@/types/viewmodels/configuration-history.viewmodel";
import type { ConfigurationLoadResult } from "@/types/configuration/status";
import type { ConfigurationHealthResult } from "@/types/configuration/status";
import type { UpgradeCheckResult } from "@/education/engines/version.engine";

export interface IConfigurationService {
  getConfigurationViewModel(tenantId: string): Promise<SchoolConfigurationViewModel | null>;
  getConfigurationHistoryViewModel(tenantId: string, limit?: number): Promise<ConfigurationHistoryViewModel[]>;
  loadConfiguration(tenantId: string): Promise<ConfigurationLoadResult>;
  saveAndPublishConfiguration(input: any, tenantId: string, userId: string): Promise<MasterSchoolConfiguration>;
  getHealthStatus(tenantId: string): Promise<ConfigurationHealthResult>;
  createDefaultConfiguration(tenantId: string, userId: string): Promise<MasterSchoolConfiguration>;
  getConfigurationForSetup(tenantId: string): Promise<SchoolConfigurationViewModel | null>;
  getConfiguration(tenantId: string): Promise<MasterSchoolConfiguration | null>;
  saveConfiguration(tenantId: string, config: MasterSchoolConfiguration): Promise<void>;
  checkForUpgrades(tenantId: string): Promise<UpgradeCheckResult>;
  upgradeCurriculum(tenantId: string, newVersionId: string, userId: string): Promise<MasterSchoolConfiguration>;
}
