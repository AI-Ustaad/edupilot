export const CONFIGURATION_STATUS = {
  NOT_CONFIGURED: "NOT_CONFIGURED",
  PARTIALLY_CONFIGURED: "PARTIALLY_CONFIGURED",
  CONFIGURED: "CONFIGURED",
  INVALID: "INVALID",
} as const;

export const CONFIGURATION_DOC_ID = "config";
export const CONFIGURATION_HISTORY_COLLECTION = "history";
export const TENANTS_COLLECTION = "tenants";
export const TENANT_SETTINGS_COLLECTION = "settings";

export const DEFAULT_SCHEMA_VERSION = 2;
export const DEFAULT_REGION = "default";
export const DEFAULT_TIMEZONE = "UTC";

export const CONFIGURATION_CACHE_TTL = 300;
export const CONFIGURATION_CACHE_TAG = "configuration";

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

export interface FeatureRegistry {
  ai: {
    enabled: boolean;
    version: string;
    permissions: string[];
    beta: boolean;
    providers: string[];
    activeProvider: string;
    quota: number;
  };
  library: {
    enabled: boolean;
    version: string;
    permissions: string[];
    beta: boolean;
  };
  transport: {
    enabled: boolean;
    version: string;
    permissions: string[];
    beta: false;
  };
  fees: {
    enabled: boolean;
    version: string;
    permissions: string[];
    beta: false;
  };
  attendance: {
    enabled: boolean;
    version: string;
    permissions: string[];
    beta: false;
  };
  exams: {
    enabled: boolean;
    version: string;
    permissions: string[];
    beta: false;
  };
}
