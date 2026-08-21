// types/configuration/core.ts

export type ConfigurationState = "Draft" | "Validated" | "Published" | "Locked" | "Archived";

export interface ConfigurationVersion {
  id: string;
  number: number;
  createdBy: string;
  createdAt: string;
  publishedBy?: string;
  publishedAt?: string;
  reason: string;
  comment?: string;
  rollbackTo?: string;
  checksum: string;
}

export interface ConfigurationMetadata {
  tenantId: string;
  schemaVersion: number;
  configurationVersion: number;
  environment: "development" | "staging" | "production";
  region: string;
  timezone: string;
  academicYearId: string | null;
  currentSnapshotId: string | null;
  isConfigured: boolean;
  configuredAt?: string;
  configuredBy?: string;
  publishedAt?: string;
  lastModified: string;
}

export interface MasterSchoolConfiguration {
  id: string;
  tenantId: string;
  state: ConfigurationState;
  metadata: ConfigurationMetadata;
  version: ConfigurationVersion;
  school: {
    name: string;
    type: "Private" | "Government" | "Madrissa";
    curriculumId: string;
    boardName: string;
    country: string;
    logoUrl?: string;
  };
  academic: {
    levels: string[];
    classes: Array<{
      id: string;
      name: string;
      level: string;
      subjects: string[];
    }>;
    sectionNames: string[];
    subjects: string[];
    requiredLabs: string[];
    requiredTeachers: Record<string, number>;
    departments?: any[];
  };
  features: {
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
      beta: boolean;
    };
    fees: {
      enabled: boolean;
      version: string;
      permissions: string[];
      beta: boolean;
    };
    attendance: {
      enabled: boolean;
      version: string;
      permissions: string[];
      beta: boolean;
    };
    exams: {
      enabled: boolean;
      version: string;
      permissions: string[];
      beta: boolean;
    };
  };
}

export interface ConfigurationServiceResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
