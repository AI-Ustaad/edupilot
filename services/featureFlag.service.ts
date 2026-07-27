// services/featureFlag.service.ts
import { ALL_FEATURES, Feature } from '@/lib/features/featureFlags';
import { SubscriptionService } from './subscription.service';
import { FeatureFlagRepository } from "@/repositories/feature-flag.repository";
import type { IFeatureFlagService } from "@/interfaces/IFeatureFlagService";

const subscriptionService = new SubscriptionService();
const featureFlagRepo = new FeatureFlagRepository();

export class FeatureFlagService implements IFeatureFlagService {
  async canUse(tenantId: string, feature: Feature): Promise<boolean> {
    const planAllows = await subscriptionService.canUseFeature(tenantId, feature);
    if (!planAllows) return false;

    const flags = await featureFlagRepo.findByTenant(tenantId);
    if (flags?.features && flags.features[feature] === false) return false;

    return true;
  }

  async setFeature(tenantId: string, feature: Feature, enabled: boolean): Promise<void> {
    await featureFlagRepo.setFeature(tenantId, feature, enabled);
  }

  async getAllFlags(tenantId: string): Promise<Record<string, boolean>> {
    return featureFlagRepo.getAllFlags(tenantId);
  }
}
