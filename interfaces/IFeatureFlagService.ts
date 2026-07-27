// interfaces/IFeatureFlagService.ts
import type { Feature } from "@/lib/features/featureFlags";

export interface IFeatureFlagService {
  canUse(tenantId: string, feature: Feature): Promise<boolean>;
  setFeature(tenantId: string, feature: Feature, enabled: boolean): Promise<void>;
  getAllFlags(tenantId: string): Promise<Record<string, boolean>>;
}
