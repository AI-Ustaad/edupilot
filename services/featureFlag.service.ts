// services/featureFlag.service.ts
import { adminDb } from '@/lib/firebase-admin';
import { ALL_FEATURES, Feature } from '@/lib/features/featureFlags';
import { SubscriptionService } from './subscription.service';

const COLLECTION = 'tenantFeatures';
const subscriptionService = new SubscriptionService();

export class FeatureFlagService {
  /**
   * Enhanced canUse: checks both tenant override AND plan limits.
   */
  async canUse(tenantId: string, feature: Feature): Promise<boolean> {
    // 1. Plan must allow the feature
    const planAllows = await subscriptionService.canUseFeature(tenantId, feature);
    if (!planAllows) return false;

    // 2. Check manual override
    const doc = await adminDb.collection(COLLECTION).doc(tenantId).get();
    if (doc.exists) {
      const features = doc.data()?.features || {};
      if (features[feature] === false) return false;
    }

    return true;
  }

  /**
   * Enable or disable a feature for a tenant.
   */
  async setFeature(tenantId: string, feature: Feature, enabled: boolean): Promise<void> {
    const ref = adminDb.collection(COLLECTION).doc(tenantId);
    await ref.set(
      { features: { [feature]: enabled } },
      { merge: true }
    );
  }

  /**
   * Return all feature flags for a tenant (manual overrides only).
   */
  async getAllFlags(tenantId: string): Promise<Record<string, boolean>> {
    const doc = await adminDb.collection(COLLECTION).doc(tenantId).get();
    if (!doc.exists) return {};
    return doc.data()?.features || {};
  }
}
