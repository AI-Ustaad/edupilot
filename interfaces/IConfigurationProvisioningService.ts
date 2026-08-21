export interface ProvisioningResult {
  academicYearId: string | null;
  sectionsCreated: number;
  departmentsCreated: number;
  warnings: string[];
}

export interface IConfigurationProvisioningService {
  provisionFromConfiguration(
    tenantId: string,
    config: import("@/types/configuration").MasterSchoolConfiguration,
    userId: string
  ): Promise<ProvisioningResult>;
}
