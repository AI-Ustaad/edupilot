import { MasterSchoolConfiguration } from "@/types/configuration";

export interface IConfigurationRepository {
  getConfig(tenantId: string): Promise<MasterSchoolConfiguration | null>;
  updateConfig(tenantId: string, data: Record<string, any>): Promise<void>;
  getGeneral(tenantId: string): Promise<Record<string, any> | null>;
  updateGeneral(tenantId: string, data: Record<string, any>): Promise<void>;
  getActiveConfiguration(tenantId: string): Promise<MasterSchoolConfiguration | null>;
  saveConfiguration(tenantId: string, data: Record<string, any>): Promise<void>;
}
