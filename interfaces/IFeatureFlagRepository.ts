export interface FeatureFlags {
  id?: string;
  tenantId: string;
  features: Record<string, boolean>;
  createdAt?: any;
  updatedAt?: any;
}

export interface IFeatureFlagRepository {
  findByTenant(tenantId: string): Promise<FeatureFlags | null>;
  setFeature(tenantId: string, feature: string, enabled: boolean): Promise<void>;
  getAllFlags(tenantId: string): Promise<Record<string, boolean>>;
}
