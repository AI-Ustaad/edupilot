export type ConfigurationStatus = "NOT_CONFIGURED" | "PARTIALLY_CONFIGURED" | "CONFIGURED" | "INVALID";

export interface TenantMetadata {
  tenantId: string;
  configuredAt?: string;
  configuredBy?: string;
  configurationVersion: number;
  schemaVersion: number;
  publishedAt?: string;
  lastModified: string;
  environment: "development" | "staging" | "production";
  region: string;
  timezone: string;
}

export interface ConfigurationHealthResult {
  healthy: boolean;
  status: ConfigurationStatus;
  diagnostics: {
    configExists: boolean;
    metadataExists: boolean;
    schoolProfileExists: boolean;
    academicStructureExists: boolean;
    isPublished: boolean;
    versionValid: boolean;
    tenantValid: boolean;
    schemaValid: boolean;
  };
  nextAction?: string;
}

export interface ConfigurationLoadResult {
  status: ConfigurationStatus;
  configuration: any | null;
  diagnostics: ConfigurationHealthResult["diagnostics"];
  nextAction?: string;
}
