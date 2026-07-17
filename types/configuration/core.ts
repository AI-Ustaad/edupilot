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
}
