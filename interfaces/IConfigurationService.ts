// interfaces/IConfigurationService.ts
import type { SchoolConfigurationViewModel } from "@/types/viewmodels/school-configuration.viewmodel";
import type { ConfigurationHistoryViewModel } from "@/types/viewmodels/configuration-history.viewmodel";
import type { MasterSchoolConfiguration } from "@/types/configuration";

export interface IConfigurationService {
  getConfigurationViewModel(tenantId: string): Promise<SchoolConfigurationViewModel | null>;
  getConfigurationHistoryViewModel(tenantId: string): Promise<ConfigurationHistoryViewModel[]>;
  saveAndPublishConfiguration(input: any, tenantId: string, userId: string): Promise<MasterSchoolConfiguration>;
}
